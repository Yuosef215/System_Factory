import asyncHandler from "express-async-handler";
import ApiError from "../../../utils/apiError.js";
import PurchaseOrder from "../../models/purchases/PurchaseOrder.js";
import PriceOffer from "../../models/purchases/PriceOffer.js";
import PurchaseRequestModel from "../../models/Purchases/PurchaseRequestModel.js";

// ─── إنشاء أمر شراء (بعد موافقة المدير) ────────────────────────────
export const createPurchaseOrder = asyncHandler(async (req, res, next) => {
  const { priceOffer: priceOfferId } = req.body;

  const offer = await PriceOffer.findById(priceOfferId);
  if (!offer) return next(new ApiError("عرض الأسعار غير موجود", 404));
  if (offer.status !== "approved") return next(new ApiError("عرض الأسعار لم تتم الموافقة عليه بعد", 400));

  // تحقق مفيش أمر شراء على نفس العرض
  const existing = await PurchaseOrder.findOne({ priceOffer: priceOfferId });
  if (existing) return next(new ApiError("يوجد أمر شراء مرتبط بهذا العرض بالفعل", 400));

  const items = offer.items.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
    supplier: item.supplier,
    receivedQuantity: 0,
    status: "pending",
  }));

  const order = await PurchaseOrder.create({
    purchaseRequest: offer.purchaseRequest,
    priceOffer: priceOfferId,
    reportNumber: offer.reportNumber,
    items,
    totalAmount: offer.totalAmount,
    confirmedBy: req.user.name,
    status: "pending",
  });

  // تحديث حالة الطلب
  await PurchaseRequestModel.findByIdAndUpdate(offer.purchaseRequest, { status: "ordered" });

  res.status(201).json({ success: true, data: order });
});

// ─── جلب كل أوامر الشراء ────────────────────────────────────────────
export const getAllPurchaseOrders = asyncHandler(async (req, res, next) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const orders = await PurchaseOrder.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: orders.length, data: orders });
});

// ─── جلب أمر شراء واحد ──────────────────────────────────────────────
export const getPurchaseOrderById = asyncHandler(async (req, res, next) => {
  const order = await PurchaseOrder.findById(req.params.id)
    .populate("purchaseRequest", "reportNumber requestedBy notes")
    .populate("priceOffer", "offeredBy totalAmount");
  if (!order) return next(new ApiError("أمر الشراء غير موجود", 404));
  res.status(200).json({ success: true, data: order });
});

// ─── تأكيد استلام البنود (كلها أو جزء منها) ─────────────────────────
export const confirmReceivedItems = asyncHandler(async (req, res, next) => {
  const { items } = req.body;
  // items: [{ itemId, receivedQuantity }]

  const order = await PurchaseOrder.findById(req.params.id);
  if (!order) return next(new ApiError("أمر الشراء غير موجود", 404));
  if (order.status === "complete") return next(new ApiError("أمر الشراء مكتمل بالفعل", 400));

  items.forEach(({ itemId, receivedQuantity }) => {
    const item = order.items.id(itemId);
    if (!item) return;
    item.receivedQuantity = receivedQuantity;
    if (receivedQuantity >= item.quantity) {
      item.status = "complete";
    } else if (receivedQuantity > 0) {
      item.status = "partial";
    } else {
      item.status = "pending";
    }
  });

  // تحديث حالة الأمر كله
  const allComplete = order.items.every((i) => i.status === "complete");
  const anyReceived = order.items.some((i) => i.receivedQuantity > 0);
  order.status = allComplete ? "complete" : anyReceived ? "partial" : "pending";

  await order.save();

  // لو اكتمل — حدّث حالة الطلب
  if (allComplete) {
    await PurchaseRequestModel.findByIdAndUpdate(order.purchaseRequest, { status: "received" });
  }

  res.status(200).json({ success: true, data: order });
});

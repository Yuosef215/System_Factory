import asyncHandler from "express-async-handler";
import ApiError from "../../../utils/apiError.js";
import PriceOffer from "../../models/purchases/PriceOffer.js";
import PurchaseRequestModel from "../../models/Purchases/PurchaseRequestModel.js";

// ─── إنشاء عرض أسعار ────────────────────────────────────────────────
export const createPriceOffer = asyncHandler(async (req, res, next) => {
  const { purchaseRequest, items } = req.body;

  const request = await PurchaseRequestModel.findById(purchaseRequest);
  if (!request) return next(new ApiError("طلب الشراء غير موجود", 404));
  if (!["pending", "price_offered"].includes(request.status))
    return next(new ApiError("لا يمكن إضافة عرض سعر لهذا الطلب في حالته الحالية", 400));

  // حساب إجمالي كل بند وإجمالي العرض
  const processedItems = items.map((item) => ({
    ...item,
    totalPrice: item.quantity * item.unitPrice,
  }));
  const totalAmount = processedItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const offer = await PriceOffer.create({
    purchaseRequest,
    reportNumber: request.reportNumber,
    offeredBy: req.user.name,
    items: processedItems,
    totalAmount,
    status: "pending",
  });

  // تحديث حالة الطلب
  await PurchaseRequestModel.findByIdAndUpdate(purchaseRequest, { status: "price_offered" });

  res.status(201).json({ success: true, data: offer });
});

// ─── جلب كل عروض الأسعار ────────────────────────────────────────────
export const getAllPriceOffers = asyncHandler(async (req, res, next) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const offers = await PriceOffer.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: offers.length, data: offers });
});

// ─── جلب عرض أسعار واحد ─────────────────────────────────────────────
export const getPriceOfferById = asyncHandler(async (req, res, next) => {
  const offer = await PriceOffer.findById(req.params.id);
  if (!offer) return next(new ApiError("عرض الأسعار غير موجود", 404));
  res.status(200).json({ success: true, data: offer });
});

// ─── جلب عروض أسعار طلب معين ────────────────────────────────────────
export const getOffersByRequest = asyncHandler(async (req, res, next) => {
  const offers = await PriceOffer.find({ purchaseRequest: req.params.requestId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: offers.length, data: offers });
});

// ─── موافقة المدير العام على عرض الأسعار ────────────────────────────
export const approvePriceOffer = asyncHandler(async (req, res, next) => {
  const { gmNotes } = req.body;

  const offer = await PriceOffer.findById(req.params.id);
  if (!offer) return next(new ApiError("عرض الأسعار غير موجود", 404));
  if (offer.status !== "pending") return next(new ApiError("تم البت في هذا العرض مسبقاً", 400));

  offer.status = "approved";
  offer.gmNotes = gmNotes || "";
  offer.reviewedBy = req.user.name;
  offer.reviewedAt = new Date();
  await offer.save();

  // تحديث حالة الطلب
  await PurchaseRequestModel.findByIdAndUpdate(offer.purchaseRequest, { status: "approved" });

  res.status(200).json({ success: true, data: offer });
});

// ─── رفض عرض الأسعار ────────────────────────────────────────────────
export const rejectPriceOffer = asyncHandler(async (req, res, next) => {
  const { gmNotes } = req.body;

  const offer = await PriceOffer.findById(req.params.id);
  if (!offer) return next(new ApiError("عرض الأسعار غير موجود", 404));
  if (offer.status !== "pending") return next(new ApiError("تم البت في هذا العرض مسبقاً", 400));

  offer.status = "rejected";
  offer.gmNotes = gmNotes || "";
  offer.reviewedBy = req.user.name;
  offer.reviewedAt = new Date();
  await offer.save();

  // رجّع حالة الطلب لـ pending
  await PurchaseRequestModel.findByIdAndUpdate(offer.purchaseRequest, { status: "rejected" });

  res.status(200).json({ success: true, data: offer });
});

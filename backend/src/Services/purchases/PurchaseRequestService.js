import asyncHandler from "express-async-handler";
import ApiError from "../../../utils/apiError.js";
import PurchaseRequestModel from "../../models/purchases/PurchaseRequest.js";
import { io } from "../../../server.js";


// ─── إنشاء طلب شراء جديد ───────────────────────────────────────────
export const createPurchaseRequest = asyncHandler(async (req, res, next) => {
  const { reportNumber, items, notes, specialized_engineer, Requesting_party } = req.body;

  if (!reportNumber) return next(new ApiError("رقم المحضر مطلوب", 400));
  if (!items || items.length === 0) return next(new ApiError("يجب إضافة بند واحد على الأقل", 400));

  const existing = await PurchaseRequestModel.findOne({ reportNumber });
  if (existing) return next(new ApiError(`رقم المحضر ${reportNumber} موجود بالفعل`, 400));

  const request = await PurchaseRequestModel.create({
    reportNumber,
    requestedBy:req.user.name,
    specialized_engineer,
    status: "pending",
    items,
    notes,
    Requesting_party,
    specialized_engineer
  });

  res.status(201).json({ success: true, data: request });
  io.to("gm").to("ceo").to("developer").emit("notification", {
    type: "new_purchase_request",
    title: "طلب شراء جديد",
    message: `${req.user.name} أنشأ طلب شراء — محضر ${reportNumber}`,
    data: { reportNumber, id: request._id },
    createdAt: new Date(),
  });
});

// ─── جلب كل طلبات الشراء ────────────────────────────────────────────
export const getAllPurchaseRequests = asyncHandler(async (req, res, next) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const requests = await PurchaseRequestModel.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: requests.length, data: requests });
});

// ─── جلب طلب شراء واحد ──────────────────────────────────────────────
export const getPurchaseRequestById = asyncHandler(async (req, res, next) => {
  const request = await PurchaseRequestModel.findById(req.params.id);
  if (!request) return next(new ApiError("طلب الشراء غير موجود", 404));
  res.status(200).json({ success: true, data: request });
});

// ─── تحديث حالة الطلب ───────────────────────────────────────────────
export const updateRequestStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const allowed = ["pending", "price_offered", "approved", "rejected", "ordered", "received", "completed"];
  if (!allowed.includes(status)) return next(new ApiError("حالة غير صحيحة", 400));

  const request = await PurchaseRequestModel.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  if (!request) return next(new ApiError("طلب الشراء غير موجود", 404));
  res.status(200).json({ success: true, data: request });
});

// ─── تعديل طلب الشراء (بس لو لسه pending) ──────────────────────────
export const updatePurchaseRequest = asyncHandler(async (req, res, next) => {
  const request = await PurchaseRequestModel.findById(req.params.id);
  if (!request) return next(new ApiError("طلب الشراء غير موجود", 404));
  if (request.status !== "pending") return next(new ApiError("لا يمكن تعديل طلب تم معالجته", 400));

  const { items, notes } = req.body;
  request.items = items ?? request.items;
  request.notes = notes ?? request.notes;
  await request.save();

  res.status(200).json({ success: true, data: request });
});

// ─── حذف طلب الشراء (بس لو لسه pending) ────────────────────────────
export const deletePurchaseRequest = asyncHandler(async (req, res, next) => {
  const request = await PurchaseRequestModel.findById(req.params.id);
  if (!request) return next(new ApiError("طلب الشراء غير موجود", 404));
  if (request.status !== "pending") return next(new ApiError("لا يمكن حذف طلب تم معالجته", 400));

  await request.deleteOne();
  res.status(200).json({ success: true, message: "تم حذف الطلب" });
});

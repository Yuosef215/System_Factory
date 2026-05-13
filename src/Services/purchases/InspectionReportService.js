import asyncHandler from "express-async-handler";
import ApiError from "../../../utils/apiError.js";
import InspectionReport from "../../models/Purchases/InspectionReport.js";
import PurchaseOrder from "../../models/Purchases/PurchaseOrder.js";
import PurchaseRequestModel from "../../models/Purchases/PurchaseRequestModel.js";

// ─── إنشاء تقرير فحص واستلام ────────────────────────────────────────
export const createInspectionReport = asyncHandler(async (req, res, next) => {
  const { purchaseOrder: orderId, items, generalNotes } = req.body;

  const order = await PurchaseOrder.findById(orderId);
  if (!order) return next(new ApiError("أمر الشراء غير موجود", 404));

  // تحقق مفيش تقرير فحص على نفس الأمر
  const existing = await InspectionReport.findOne({ purchaseOrder: orderId });
  if (existing) return next(new ApiError("يوجد تقرير فحص مرتبط بهذا الأمر بالفعل", 400));

  const report = await InspectionReport.create({
    purchaseOrder: orderId,
    reportNumber: order.reportNumber,
    inspectedBy: req.user.name,
    items,
    generalNotes,
    status: "pending",
    addedToInventory: false,
  });

  res.status(201).json({ success: true, data: report });
});

// ─── جلب كل تقارير الفحص ────────────────────────────────────────────
export const getAllInspectionReports = asyncHandler(async (req, res, next) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const reports = await InspectionReport.find(filter)
    .populate("purchaseOrder", "reportNumber totalAmount confirmedBy")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: reports.length, data: reports });
});

// ─── جلب تقرير فحص واحد ─────────────────────────────────────────────
export const getInspectionReportById = asyncHandler(async (req, res, next) => {
  const report = await InspectionReport.findById(req.params.id)
    .populate("purchaseOrder");
  if (!report) return next(new ApiError("تقرير الفحص غير موجود", 404));
  res.status(200).json({ success: true, data: report });
});

// ─── الموافقة على تقرير الفحص (وإرساله لقائمة الإضافة للمخزن) ───────
export const approveInspectionReport = asyncHandler(async (req, res, next) => {
  const report = await InspectionReport.findById(req.params.id);
  if (!report) return next(new ApiError("تقرير الفحص غير موجود", 404));
  if (report.status === "approved") return next(new ApiError("تم اعتماد التقرير مسبقاً", 400));

  report.status = "approved";
  await report.save();

  // تحديث حالة الطلب الأصلي
  const order = await PurchaseOrder.findById(report.purchaseOrder);
  if (order) {
    await PurchaseRequestModel.findByIdAndUpdate(
      order.purchaseRequest,
      { status: "completed" }
    );
  }

  res.status(200).json({ success: true, data: report });
});

// ─── تأكيد الإضافة للمخزن ───────────────────────────────────────────
export const markAddedToInventory = asyncHandler(async (req, res, next) => {
  const report = await InspectionReport.findById(req.params.id);
  if (!report) return next(new ApiError("تقرير الفحص غير موجود", 404));
  if (report.status !== "approved") return next(new ApiError("يجب اعتماد التقرير أولاً", 400));
  if (report.addedToInventory) return next(new ApiError("تمت الإضافة للمخزن مسبقاً", 400));

  report.addedToInventory = true;
  await report.save();

  res.status(200).json({ success: true, message: "تم تأكيد الإضافة للمخزن", data: report });
});

// ─── جلب التقارير الجاهزة للإضافة للمخزن ───────────────────────────
export const getPendingInventoryAdditions = asyncHandler(async (req, res, next) => {
  const reports = await InspectionReport.find({
    status: "approved",
    addedToInventory: false,
  }).populate("purchaseOrder", "reportNumber confirmedBy");
  res.status(200).json({ success: true, count: reports.length, data: reports });
});

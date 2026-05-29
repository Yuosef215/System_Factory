import Leave from "../../models/HR/LeaveModel.js";
import asyncHandler from "express-async-handler";

// جيب كل الإجازات
export const getAllLeaves = (asyncHandler(async (req, res) => {
  const { status, employee } = req.query;
  const filter = {};
  if (status)   filter.status = status;
  if (employee) filter.employee = employee;

  const leaves = await Leave.find(filter)
    .populate("employee", "name department jobTitle")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: leaves });
}));

// طلب إجازة
export const createLeave = (asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.body;
  const start = new Date(startDate);
  const end   = new Date(endDate);
  const days  = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const leave = await Leave.create({ ...req.body, days });
  res.status(201).json({ success: true, data: leave });
}));

// موافقة أو رفض
export const updateLeaveStatus = (asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const leave = await Leave.findByIdAndUpdate(
    req.params.id,
    { status, notes, approvedBy: req.user.name },
    { new: true }
  ).populate("employee", "name");

  if (!leave) return res.status(404).json({ success: false, message: "الإجازة غير موجودة" });
  res.json({ success: true, data: leave });
}));

// حذف إجازة
export const deleteLeave = (asyncHandler(async (req, res) => {
  await Leave.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "تم الحذف" });
}));

// رصيد إجازات موظف
export const getLeaveBalance = (asyncHandler(async (req, res) => {
  const { id } = req.params;
  const year = new Date().getFullYear();

  const leaves = await Leave.find({
    employee: id,
    status: "approved",
    startDate: { $gte: new Date(year, 0, 1) }
  });

  const balance = {
    annual:    { used: 0, total: 21 },
    sick:      { used: 0, total: 14 },
    emergency: { used: 0, total: 6 },
    unpaid:    { used: 0, total: Infinity },
  };

  leaves.forEach((l) => {
    if (balance[l.type]) balance[l.type].used += l.days;
  });

  res.json({ success: true, data: balance });
}));
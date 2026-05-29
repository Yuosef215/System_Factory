import Employee from "../../models/HR/EmployeeModel.js";
import asyncHandler from "express-async-handler";

// جيب كل الموظفين
export const getAllEmployees = (asyncHandler(async (req, res) => {
  const employees = await Employee.find().sort({ createdAt: -1 });
  res.json({ success: true, data: employees });
}));

// جيب موظف واحد
export const getEmployee = (asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) return res.status(404).json({ success: false, message: "الموظف غير موجود" });
  res.json({ success: true, data: employee });
}));

// أضف موظف جديد
export const createEmployee = (asyncHandler(async (req, res) => {
  const employee = await Employee.create(req.body);
  res.status(201).json({ success: true, data: employee });
}));

// عدل موظف
export const updateEmployee = (asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!employee) return res.status(404).json({ success: false, message: "الموظف غير موجود" });
  res.json({ success: true, data: employee });
}));

// حذف موظف
export const deleteEmployee = (asyncHandler(async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "تم الحذف" });
}));

// إحصائيات
export const getEmployeeStats = (asyncHandler(async (req, res) => {
  const total      = await Employee.countDocuments();
  const active     = await Employee.countDocuments({ status: "active" });
  const inactive   = await Employee.countDocuments({ status: "inactive" });
  const terminated = await Employee.countDocuments({ status: "terminated" });
  res.json({ success: true, data: { total, active, inactive, terminated } });
}));
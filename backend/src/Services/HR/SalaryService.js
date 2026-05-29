import Salary from "../../models/HR/SalaryModel.js";
import Employee from "../../models/HR/EmployeeModel.js";
import Attendance from "../../models/HR/AttendanceModel.js";
import asyncHandler from "express-async-handler";

// احسب المرتب تلقائي
export const calculateSalary = (asyncHandler(async (req, res) => {
  const { employeeId, month, year } = req.body;

  const employee = await Employee.findById(employeeId);
  if (!employee) return res.status(404).json({ success: false, message: "الموظف غير موجود" });

  // جيب أيام الغياب
  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 0, 23, 59, 59);

  const absences = await Attendance.countDocuments({
    employee: employeeId,
    date: { $gte: start, $lte: end },
    status: "absent"
  });

  const workingDays      = 26;
  const dailyRate        = employee.salary / workingDays;
  const absenceDeduction = absences * dailyRate;
  const netSalary        = employee.salary - absenceDeduction + (req.body.bonus || 0) - (req.body.deductions || 0);

  const existing = await Salary.findOne({ employee: employeeId, month, year });
  if (existing) return res.status(400).json({ success: false, message: "المرتب محسوب بالفعل لهذا الشهر" });

  const salary = await Salary.create({
    employee:         employeeId,
    month,
    year,
    baseSalary:       employee.salary,
    bonus:            req.body.bonus || 0,
    deductions:       req.body.deductions || 0,
    absenceDays:      absences,
    absenceDeduction: Math.round(absenceDeduction),
    netSalary:        Math.round(netSalary),
    calculatedBy:     req.user.name,
  });

  res.status(201).json({ success: true, data: salary });
}));

// جيب مرتبات شهر معين
export const getMonthlySalaries = (asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const salaries = await Salary.find({ month, year })
    .populate("employee", "name department jobTitle")
    .sort({ createdAt: -1 });

  const total = salaries.reduce((s, sal) => s + sal.netSalary, 0);
  res.json({ success: true, data: salaries, total });
}));

// ادفع المرتب
export const paySalary = (asyncHandler(async (req, res) => {
  const salary = await Salary.findByIdAndUpdate(
    req.params.id,
    { status: "paid", paidAt: new Date() },
    { new: true }
  ).populate("employee", "name");

  if (!salary) return res.status(404).json({ success: false, message: "المرتب غير موجود" });
  res.json({ success: true, data: salary });
}));

// جيب مرتبات موظف معين
export const getEmployeeSalaries = (asyncHandler(async (req, res) => {
  const salaries = await Salary.find({ employee: req.params.id })
    .sort({ year: -1, month: -1 });
  res.json({ success: true, data: salaries });
}));
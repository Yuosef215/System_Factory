import Attendance from "../../models/HR/AttendanceModel.js";
import Employee from "../../models/HR/EmployeeModel.js";
import asyncHandler from 'express-async-handler';

// سجل حضور يدوي
export const recordAttendance = (asyncHandler(async (req, res) => {
  const { employee, date, checkIn, checkOut, status, notes } = req.body;

  const existing = await Attendance.findOne({
    employee,
    date: { $gte: new Date(date).setHours(0,0,0,0), $lt: new Date(date).setHours(23,59,59,999) }
  });

  if (existing) {
    const updated = await Attendance.findByIdAndUpdate(existing._id, req.body, { new: true });
    return res.json({ success: true, data: updated });
  }

  const attendance = await Attendance.create({ ...req.body, recordedBy: req.user.name });
  res.status(201).json({ success: true, data: attendance });
}));

// جيب حضور يوم معين
export const getDailyAttendance = (asyncHandler(async (req, res) => {
  const { date } = req.query;
  const start = new Date(date); start.setHours(0,0,0,0);
  const end   = new Date(date); end.setHours(23,59,59,999);

  const attendance = await Attendance.find({
    date: { $gte: start, $lte: end }
  }).populate("employee", "name department jobTitle");

  // الموظفين اللي مسجلوش
  const allEmployees = await Employee.find({ status: "active" });
  const presentIds   = attendance.map((a) => a.employee._id.toString());
  const absent       = allEmployees.filter((e) => !presentIds.includes(e._id.toString()));

  res.json({ success: true, data: attendance, absent });
}));

// جيب حضور موظف معين
export const getEmployeeAttendance = (asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { month, year } = req.query;

  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 0, 23, 59, 59);

  const attendance = await Attendance.find({
    employee: id,
    date: { $gte: start, $lte: end }
  }).sort({ date: 1 });

  res.json({ success: true, data: attendance });
}));

// إحصائيات الحضور الشهري
export const getMonthlyStats = (asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 0, 23, 59, 59);

  const stats = await Attendance.aggregate([
    { $match: { date: { $gte: start, $lte: end } } },
    { $group: {
      _id: "$status",
      count: { $sum: 1 }
    }}
  ]);

  res.json({ success: true, data: stats });
}));
import express from "express";
import { protect, allowedTo } from "../../Services/users/usersSevices.js";

import {
  getAllEmployees, getEmployee, createEmployee,
  updateEmployee, deleteEmployee, getEmployeeStats
} from "../../Services/HR/EmployeeService.js";

import {
  recordAttendance, getDailyAttendance,
  getEmployeeAttendance, getMonthlyStats
} from "../../Services/HR/AttendanceService.js";

import {
  getAllLeaves, createLeave,
  updateLeaveStatus, deleteLeave, getLeaveBalance
} from "../../Services/HR/LeaveService.js";

import {
  calculateSalary, getMonthlySalaries,
  paySalary, getEmployeeSalaries
} from "../../Services/HR/SalaryService.js";

const router = express.Router();

const HR_ROLES = ["developer", "gm", "ceo", "hr_manager"];

router.use(protect);

// ── Employees ─────────────────────────────────────────────────
router.get("/employees/stats",        allowedTo(...HR_ROLES), getEmployeeStats);
router.get("/employees",              allowedTo(...HR_ROLES), getAllEmployees);
router.get("/employees/:id",          allowedTo(...HR_ROLES), getEmployee);
router.post("/employees",             allowedTo(...HR_ROLES), createEmployee);
router.put("/employees/:id",          allowedTo(...HR_ROLES), updateEmployee);
router.delete("/employees/:id",       allowedTo(...HR_ROLES), deleteEmployee);

// ── Attendance ────────────────────────────────────────────────
router.post("/attendance",            allowedTo(...HR_ROLES), recordAttendance);
router.get("/attendance/daily",       allowedTo(...HR_ROLES), getDailyAttendance);
router.get("/attendance/stats",       allowedTo(...HR_ROLES), getMonthlyStats);
router.get("/attendance/:id",         allowedTo(...HR_ROLES), getEmployeeAttendance);

// ── Leaves ────────────────────────────────────────────────────
router.get("/leaves",                 allowedTo(...HR_ROLES), getAllLeaves);
router.post("/leaves",                allowedTo(...HR_ROLES), createLeave);
router.patch("/leaves/:id/status",    allowedTo(...HR_ROLES), updateLeaveStatus);
router.delete("/leaves/:id",          allowedTo(...HR_ROLES), deleteLeave);
router.get("/leaves/balance/:id",     allowedTo(...HR_ROLES), getLeaveBalance);

// ── Salary ────────────────────────────────────────────────────
router.post("/salary/calculate",      allowedTo(...HR_ROLES), calculateSalary);
router.get("/salary/monthly",         allowedTo(...HR_ROLES), getMonthlySalaries);
router.patch("/salary/:id/pay",       allowedTo(...HR_ROLES), paySalary);
router.get("/salary/employee/:id",    allowedTo(...HR_ROLES), getEmployeeSalaries);

export default router;
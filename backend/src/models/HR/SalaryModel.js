import mongoose from "mongoose";

const salarySchema = new mongoose.Schema({
  employee:      { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  month:         { type: Number, required: true }, // 1-12
  year:          { type: Number, required: true },
  baseSalary:    { type: Number, required: true },
  bonus:         { type: Number, default: 0 },
  deductions:    { type: Number, default: 0 },
  absenceDays:   { type: Number, default: 0 },
  absenceDeduction: { type: Number, default: 0 },
  netSalary:     { type: Number, required: true },
  status:        { type: String, enum: ["pending", "paid"], default: "pending" },
  paidAt:        { type: Date },
  notes:         { type: String },
  calculatedBy:  { type: String },
}, { timestamps: true });

// منع تكرار المرتب لنفس الموظف في نفس الشهر
salarySchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model("Salary", salarySchema);
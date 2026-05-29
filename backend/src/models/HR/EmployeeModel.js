import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  nationalId:   { type: String, required: true, unique: true },
  phone:        { type: String },
  address:      { type: String },
  department:   { type: String, required: true },
  jobTitle:     { type: String, required: true },
  salary:       { type: Number, required: true },
  startDate:    { type: Date, required: true },
  status:       { type: String, enum: ["active", "inactive", "terminated"], default: "active" },
  fingerPrintId: { type: String }, // رقم البصمة
  notes:        { type: String },
}, { timestamps: true });

export default mongoose.model("Employee", employeeSchema);
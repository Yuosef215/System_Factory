import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employee:   { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  date:       { type: Date, required: true },
  checkIn:    { type: Date },
  checkOut:   { type: Date },
  status:     { type: String, enum: ["present", "absent", "late", "half_day"], default: "present" },
  notes:      { type: String },
  recordedBy: { type: String }, // يدوي من المدير
}, { timestamps: true });

export default mongoose.model("Attendance", attendanceSchema);
import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  employee:   { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  type:       { type: String, enum: ["annual", "sick", "emergency", "unpaid"], required: true },
  startDate:  { type: Date, required: true },
  endDate:    { type: Date, required: true },
  days:       { type: Number, required: true },
  reason:     { type: String },
  status:     { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  approvedBy: { type: String },
  notes:      { type: String },
}, { timestamps: true });

export default mongoose.model("Leave", leaveSchema);
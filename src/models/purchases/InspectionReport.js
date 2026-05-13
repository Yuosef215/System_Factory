import mongoose from "mongoose";


const InspectionReportSchema = new mongoose.Schema({
  purchaseOrder: mongoose.Schema.Types.ObjectId,
  reportNumber: String,
  inspectedBy: String,
  items: [{
    description: String,
    quantityOrdered: Number,
    quantityReceived: Number,
    status: {type: String,enum: ["ok", "damaged", "missing"]},
    notes: String,
  }],
  generalNotes: String,
  status: {type: String,enum:["pending", "approved"]},
  addedToInventory: Boolean,
});

const InspectionReport = mongoose.model("InspectionReport",InspectionReportSchema);
export default InspectionReport;
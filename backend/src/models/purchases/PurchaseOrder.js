import mongoose from "mongoose";


const PurchaseOrderSchema = new mongoose.Schema({
  purchaseRequest: mongoose.Schema.Types.ObjectId,
  priceOffer: mongoose.Schema.Types.ObjectId,
  reportNumber: String,        // نفس رقم المحضر
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,
    supplier: String,
    receivedQuantity: Number,  // اللي جه فعلاً
    status:{ type: String ,enum:["pending", "partial", "complete"]},
  }],
  totalAmount: Number,
  confirmedBy: String,
  status: {type: String,enum:["pending", "partial", "complete"]},
});

const PurchaseOrder = mongoose.model("PurchaseOrder", PurchaseOrderSchema);
export default PurchaseOrder;
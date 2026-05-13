import mongoose from "mongoose";


const PriceOfferSchema = new mongoose.Schema({
  purchaseRequest: mongoose.Schema.Types.ObjectId,   // ref PurchaseRequest
  reportNumber: String,        // نفس رقم المحضر
  offeredBy: String,
  items: [{
    itemRef: mongoose.Schema.Types.ObjectId,         // ref لـ item في الطلب
    description: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,
    supplier: String,          // المورد
  }],
  totalAmount: Number,
  status: {type: String, enum: ["pending", "approved", "rejected"]},
  gmNotes: String,
  reviewedBy: String,
  reviewedAt: Date,
},
{timestamps: true, versionKey: false});

const PriceOffer = mongoose.model("PriceOffer", PriceOfferSchema);
export default PriceOffer;
import mongoose from "mongoose";


const  PurchaseRequestShcema = new mongoose.Schema({
  reportNumber: String,
  requestedBy: String,
  specialized_engineer: String,
  status: { type: String, enum: ["pending", "price_offered", "approved", "rejected", "ordered", "received", "completed"] },
  items: [{
    itemType: { type: String, enum: ["inventory", "manual"] }, 
    inventoryRef: mongoose.Schema.Types.ObjectId,    
    inventoryModel: String,
    description: String,      
    quantity: Number,
    unit: String,
    Requesting_party: String,
  }],
  notes: String,
  createdAt: Date
},{timestamps: true, versionKey: false})

const PurchaseRequestModel = mongoose.model("PurchaseRequest", PurchaseRequestShcema);

export default PurchaseRequestModel;
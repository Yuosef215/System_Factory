import mongoose from "mongoose";


const cablesMovementSchema = new mongoose.Schema({
    cables: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cables",
        required: true
    },
    quantity: { 
        type: Number, 
        required: true 
    },
    process: { 
        type: String, 
        enum: ["صرف", "إضافة"],
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    },
    balanceBefore: {
        type: Number,
        required: true
    },
    balanceAfter: {
        type: Number,
        required: true
    }
}, { timestamps: true , versionKey: false });

const cablesMovement = mongoose.model("CablesMovement", cablesMovementSchema);

export default cablesMovement;
import mongoose from "mongoose";

const rollMovementSchema = new mongoose.Schema({
    roll: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Roll",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    codeRoll: String,
    reason: {
        type: String,
        enum: ["production", "maintenance", "purchase"],
        required: true,
    },
    process: {
        type: String,
        enum: ["إضافة", "صرف"],
        required: true,
    },
    balanceBefore: Number,  // الرصيد قبل الصرف
    balanceAfter: Number,   // الرصيد بعد الصرف
    createdBy: String,      // مين صرف
}, { timestamps: true,
    versionKey: false
 });

const RollMovementModel = mongoose.model("RollMovement", rollMovementSchema)
export default RollMovementModel;
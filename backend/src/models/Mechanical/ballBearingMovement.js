import mongoose from "mongoose";

const ballBearingMovementSchema = new mongoose.Schema({
    ballBearing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BallBearing",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
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

const BallBearingMovementModel = mongoose.model("BallBearingMovement", ballBearingMovementSchema)
export default BallBearingMovementModel;
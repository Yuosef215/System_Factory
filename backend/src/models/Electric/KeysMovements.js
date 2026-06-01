import mongoose from 'mongoose';



const KeyMovements = new mongoose.Schema({
    hose: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ElectricalHose",
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    process: {
        type: String,
        enum: ["صرف", "اضافه"],
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
}, { timestamps: true, versionKey: false });

const KeysMonements = mongoose.model("KeyMovements", KeyMovements);

export default KeysMonements;
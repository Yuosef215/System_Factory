import mongoose from "mongoose";


const ContactorMovementSchema = new mongoose.Schema({
    contactor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contactor",
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

const ContactorMovement = mongoose.model("ContactorMovement", ContactorMovementSchema);

export default ContactorMovement;
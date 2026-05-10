import mongoose from "mongoose";


const cablesSchema = new mongoose.Schema({
    details: {
        type: Number,
        required: true,
    },
    Lengths: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        required: true
    },
}, { timestamps: true, versionKey: false });

const cablesModel = mongoose.model('cables', cablesSchema);
export default cablesModel;
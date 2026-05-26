import mongoose from "mongoose";

const TimersSchema = new mongoose.Schema({
    numbers: {
        type: Number,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
}, { timestamps: true, versionKey: false });

const TimersModel = mongoose.model("Timers", TimersSchema);

export default TimersModel;
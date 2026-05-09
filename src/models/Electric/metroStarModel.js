import mongoose from "mongoose";

const MetroStarSchema = new mongoose.Schema({
    current: {
        type: Number,
        required: true,
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

const MetroStarModel = mongoose.model("MetroStar", MetroStarSchema);

export default MetroStarModel;

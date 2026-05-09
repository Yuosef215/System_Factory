import mongoose from "mongoose";


const rollSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: [ true, "Company name is required" ],
    },
    rollCode: {
        type: String,
        required: [ true, "Roll code is required" ],
        unique: true
    },
    widthRoll: {
        type: Number,
        required: [ true, "Width roll is required" ],
    },
    diameterRoll: {
        type: Number,
        required: [ true, "Diameter roll is required" ],
    },
    stock: {
        type: Number,
        required: [ true, "Stock is required" ],
    },
    createdBy: String,      // مين صرف  
}, {
    timestamps: true,
    versionKey: false
});


const RollModel = mongoose.model("Roll", rollSchema);
export default RollModel;
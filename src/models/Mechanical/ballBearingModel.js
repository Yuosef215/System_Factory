import mongoose from "mongoose";

const ballBearingSchema = new mongoose.Schema({
    innerdiameter: {
        type: String,
        required: [true, "Please enter the ball bearing inner diameter"],
        trim: true,
    },
    outerdiameter: {
        type: String,
        required: [true, "Please enter the ball bearing outer diameter"],
        trim: true,
    },
    width: {
        type: String,
        required: [true, "Please enter the ball bearing width"],
        trim: true,
    },
    code: {
        type: String,
        required: [true, "Please enter the ball bearing code"],
        unique: true,
        trim: true,
    },
    brandtype: {
        type: String,
        required: [true, "Please enter the ball bearing brand type"],
        trim: true,
    },
    stock: {
        type: Number,
        required: [true, "Please enter the ball bearing stock"],
    },
}, { timestamps: true,
    versionKey: false
 });

const BallBearingModel = mongoose.model("BallBearing", ballBearingSchema)
export default BallBearingModel;
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        trim: true,
    },
    role: {
        type: String,
        enum: [
            "developer",
            "warehouse_manager",
            "warehouse_worker",
            "production_manager",
            "maintenance_manager",
            "purchase_manager",
            "electricity_manager",
            "gm",
            "ceo",
            "viewer"
        ],
        default: "viewer",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    code: {
        type: String,
        required: [true, "Please enter your code"],
        unique: true,
        trim: true,
    },

}, { timestamps: true, versionKey: false });


const UserModel = mongoose.model('User', userSchema);
export default UserModel;
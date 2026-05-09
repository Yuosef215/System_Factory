import mongoose from "mongoose";

const ContactorSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    mass_kg: {
        type: Number,
        required: true
    },
    volt:{
        type: Number,
        required: true
    },
    not_asstant: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
}, { timestamps: true, versionKey: false });

const ContactorModel = mongoose.model("Contactor", ContactorSchema);

export default ContactorModel;
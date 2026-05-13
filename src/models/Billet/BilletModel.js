import mongoose from "mongoose";


const BilletSchema = new mongoose.Schema({
    length: {
        type: Number,
        required: [true , 'The Length is Required'],
    },
    mass: {
        type: Number,
        required: [true , 'The Mass Is Required'],
    },
    stock: {
        type: Number,
        required: [true, 'The Stock is Required'],
    },
    companyName: {
        type: String,
        required: [true, 'The company Name Required'],
    }
},{timestamps: true,versionKey: true})

const BilletModel = mongoose.model('Billet',BilletSchema);
export default BilletModel;
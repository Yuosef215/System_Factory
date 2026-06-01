import mongoose from 'mongoose';

const electricalHoseSchema = new mongoose.Schema({
    type_details: {
        type: Number,
        required: true,
    },
    lengths: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        required: true
    },
    diameter: {
        type: String,
        required: true,
        enum: ['1/2 inch', '3/4 inch', '1 inch', '1.5 inch', '2 inch', '2.5 inch', '3 inch'],
        default: 'not specified'
    }
}, { timestamps: true, versionKey: false });

const ElectricalHose = mongoose.model('ElectricalHose', electricalHoseSchema);
export default ElectricalHose;
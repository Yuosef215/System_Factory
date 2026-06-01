import mongoose from 'mongoose';



const costCenterSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ["mechanical","production","HR","electrical","technical_office","iT"],
        required: true
    }
},{timestamps: true,versionKey: false});

const CostCenter = mongoose.model('Costcenter',costCenterSchema);

export default CostCenter;
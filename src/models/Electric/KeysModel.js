import mongoose from 'mongoose';

const KeysSchema = new mongoose.Schema({
    typeKey: { type: String, required: true },
    color: { type: String, required: true },
    not_assistant: { type: Boolean, required: true },
    stock: { type: Number, required: true }
}, { timestamps: true , versionKey: false });

const KeysModel = mongoose.model('Keys', KeysSchema);

export default KeysModel;
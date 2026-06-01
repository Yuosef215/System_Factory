import mongoose from 'mongoose';



const ActivityLogSchema = new mongoose.Schema({
    user :{
        type: String,
    },
    action: String,
    module: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
},{timestamps:true,versionKey:false});

const ActivityLogModel = mongoose.model("ActivityLog", ActivityLogSchema);

export default ActivityLogModel;
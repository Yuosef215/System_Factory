import asyncHandler from 'express-async-handler';
import ActivityLogModel from '../../models/ActivityLog/ActivityLogModel.js';



export const getAllActivityLog = asyncHandler(async(req,res,next)=>{
    const AllActivityLog = await ActivityLogModel.find().sort({createdAt:-1}).limit(100);
    res.status(200).json({Total: AllActivityLog.length,data: AllActivityLog})
});

export const deleteAllActivityLog = asyncHandler(async(req,res,next)=>{
    await ActivityLogModel.deleteMany();
    res.status(200).json({message: "All activity log deleted successfully"})
});
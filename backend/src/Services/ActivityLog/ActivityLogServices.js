import asyncHandler from 'express-async-handler';
import ActivityLogModel from '../../models/ActivityLog/ActivityLogModel.js';



export const getAllActivityLog = asyncHandler(async(req,res,next)=>{
    const AllActivityLog = await ActivityLogModel.find();
    res.status(200).json({Total: AllActivityLog.length,data: AllActivityLog})
});
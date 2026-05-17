import asyncHandler from "express-async-handler";
import ApiError from '../../../utils/apiError';
import BilletModel from "../../models/Billet/BilletModel";




export const createOrder = asyncHandler(async (req,res,next) =>{
    const {length,mass,stock,companyName} = req.body;
    const newBillet = BilletModel.create({
        length,
        mass,
        stock,
        companyName
    });
    if (!newBillet) {
        return next(new ApiError('Created not Created!'))
    }
    res.status(200).json({success: true, data: newBillet});
});

export const getAllBillet = asyncHandler(async (req,res,next) =>{
    const Billet = await BilletModel.find();
    res.status(200).json({success: true, data: Billet});
});

export const getBillet = asyncHandler(async (req,res,next) => {
    const Billet = await BilletModel.findById(req.params.id);
    if(!Billet) {
        return next(new ApiError("Billet not found",404))
    };
    res.status(200).json({success: true, data: Billet});
});


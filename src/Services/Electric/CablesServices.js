import asyncHandler from "express-async-handler";
import ApiError from "../../../utils/apiError.js";
import cablesModel from "../../models/Electric/cablesModel.js";




export const cteateCable = asyncHandler(async (req,res,next) => {
    const {details , lengths , stock} = req.body;

    const newCable = await cablesModel.create({
        details,
        lengths,
        stock
    });
    if(!newCable) {
        return next(new ApiError("Cable not Created!", 400))
    };
    res.status(201).json({ succes:true, data: newCable});
});


export const getCable = asyncHandler(async (req,res,next) =>{
    const cable = await cablesModel.findById(req.params.id);
    if(!cable) {
        return next(new ApiError("Cable not found",404))
    };
    res.status(200).json({success: true, data: cable});
});

export const getAllCables = asyncHandler (async (req,res,next) => {
    const Cables = await cablesModel.find();
    res.status(200).json({success: true, data: Cables});
});

export const updateCable = asyncHandler(async(req,res,next) => {
    const {details , lengths , stock} = req.body;
    const cable = await cablesModel.findByIdAndUpdate(req.params.id, {
    details , 
    lengths , 
    stock
    },{new:true});

    if(!cable) {
        return next(new ApiError('Cable not found', 404))
    };
    res.status(200).json({ success:true, data: cable});
});
import asyncHandler from "express-async-handler";
import ApiError from "../../../utils/apiError.js";
import cablesModel from "../../models/Electric/cablesModel.js";
import cablesMovement from '../../models/Electric/cablesMovement.js';




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
    details,
    lengths,
    stock
    },{new:true});

    if(!cable) {
        return next(new ApiError('Cable not found', 404))
    };
    res.status(200).json({ success:true, data: cable});
});

export const dispenseCable = asyncHandler( async (req,res,next )=> {
    const { id } = req.params;
    const { quantity , reason} = req.body;
    const cable = await cablesModel.findById(id);
    if(!cable) {
        return next(new ApiError(`Cable with id ${id} not found`, 400));
    };
    if(cable.stock < quantity) {
        return next (new ApiError(`Not enough stock available for contactor with id ${id}`,400));
    };
    cable.stock -= quantity;
    await cable.save();
    const movement = await cablesMovement.create({
        cables: id,
        quantity,
        process: "صرف",
        reason,
        createdBy: req.user.name,
        balanceBefore: cable.stock + quantity,
        balanceAfter: cable.stock,
    });
    res.status(200).json({success: true, data: cable});
});


export const AddstockCable = asyncHandler(async (req,res,next) => {
    const { id } = req.params;
    const { quantity , reason} = req.body;
    const cable = await cablesModel.findById(id);
    if(!cable) {
        return next(new ApiError(`Cable with id ${id} not found`, 400));
    };
    cable.stock += quantity;
    await cable.save();
    const movement = await cablesMovement.create({
        cables: id,
        quantity,
        process: "صرف",
        reason,
        createdBy: req.user.name,
        balanceBefore: cable.stock - quantity,
        balanceAfter: cable.stock,
    });
    res.status(200).json({success: true, data: cable});
});

export const getCablesMovements = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const movements = await cablesMovement.find({ contactor: id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: movements.length, data: movements });
});

export const getAllCableMovements = asyncHandler(async (req, res, next) => {
    const movements = await cablesMovement.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: movements.length, data: movements });
});
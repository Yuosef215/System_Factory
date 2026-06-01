import asyncHandler from "express-async-handler";
import ApiError from "../../../utils/apiError.js";
import ElectricalHose from "../../models/Electric/electricalHose.js";
import HoseMonements from "../../models/Electric/electricalHoseMovements.js";



export const createHose = asyncHandler(async(req,res,next) => {
    const {type_details,lengths,stock,diameter} = req.body;

    const newHose = await ElectricalHose.create({
        type_details,
        lengths,
        stock,
        diameter
    });
    if(!newHose) {
        return next(new ApiError("Electrical not created!", 400))
    };
    res.status(201).json({succes: true, data: newHose});
});

export const getHose = asyncHandler(async (req,res,next)=>{
    const Hoses = await ElectricalHose.findById(req.params.id);
    if(!Hoses) {
        return next (new ApiError("Hoses not found",404))
    };
    res.status(200).json({succes: true, data: Hoses});
});

export const getAllHoses = asyncHandler(async(req,res,next)=>{
    const Hoses = await ElectricalHose.find().limit(20);
    res.status(200).json({succes: true, data: Hoses});
});

export const updateHose = asyncHandler(async (req,res,next)=>{
    const {type_details,lengths,stock,diameter} = req.body;
    const Hose = await ElectricalHose.findByIdAndUpdate(req.params.id,{
        type_details,
        lengths,
        stock,
        diameter
    },{new:true});

    if(!Hose) {
        return next(new ApiError("Hose not found",404))
    };
    res.status(200).json({success:true,data: Hose});
});

export const dispenseHose = asyncHandler(async(req,res,next)=>{
    const {id} = req.params;
    const {quantity,reason} = req.body;
    const Hose = await ElectricalHose.findById(id);
    if (!Hose) {
        return next (new ApiError(`Hose with id ${id} not found`,400));
    };
    if(Hose.stock < quantity) {
        return next (new ApiError(`not enough stock available for hose with id ${id}`,400));
    };
    Hose.stock -= quantity;
    await Hose.save();
    const movement = await HoseMonements.create({
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

export const AddstockHose = asyncHandler(async(req,res,next)=>{
    const { id } = req.params;
    const { quantity , reason} = req.body;
    const Hose = await ElectricalHose.findById(id);
    if(!Hose) {
        return next(new ApiError(`Cable with id ${id} not found`, 400));
    };
    cable.stock += quantity;
    await cable.save();
    const movement = await HoseMonements.create({
        cables: id,
        quantity,
        process: "صرف",
        reason,
        createdBy: req.user.name,
        balanceBefore: cable.stock - quantity,
        balanceAfter: cable.stock,
    });
    res.status(200).json({success: true, data: Hose});
});

export const getHosesMovements = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const movements = await HoseMonements.find({ contactor: id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: movements.length, data: movements });
});

export const getAllHoseMovements = asyncHandler(async (req, res, next) => {
    const movements = await HoseMonements.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: movements.length, data: movements });
});
import asyncHandler from "express-async-handler";
import ApiError from "../../../utils/apiError.js";
import ContactorModel from "../../Models/Electric/ContactorModel.js";
import ContactorMovement from "../../Models/Electric/ContactorMovement.js";




export const ctreateContactor = asyncHandler(async (req, res, next) => {
    const {companyName, mass_kg, volt, not_asstant, stock} = req.body;

    const newContactor = await ContactorModel.create({
        companyName,
        mass_kg,
        volt,
        not_asstant,
        stock
    });
    if (!newContactor) {
        return next(new ApiError("Contactor not created", 400));
    };
    res.status(201).json({ success: true, data: newContactor });
});

export const getContactor = asyncHandler(async (req, res, next) => {
    const contactor = await ContactorModel.findById(req.params.id);
    if (!contactor) {
        return next(new ApiError("Contactor not found", 404));
    }
    res.status(200).json({ success: true, data: contactor });
});

export const getAllContactors = asyncHandler(async (req, res, next) => {
    const contactors = await ContactorModel.find();
    res.status(200).json({ success: true, data: contactors });
});

export const updateContactor = asyncHandler(async (req, res, next) => {
    const {companyName, mass_kg, volt, not_asstant, stock} = req.body;
    const contactor = await ContactorModel.findByIdAndUpdate(req.params.id, {
        companyName,
        mass_kg,
        volt,
        not_asstant,
        stock
    }, { new: true });
    if (!contactor) {
        return next(new ApiError("Contactor not found", 404));
    }
    res.status(200).json({ success: true, data: contactor });
});

export const deleteContactor = asyncHandler(async (req, res, next) => {
    const contactor = await ContactorModel.findByIdAndDelete(req.params.id);
    if (!contactor) {
        return next(new ApiError("Contactor not found", 404));
    }
    res.status(200).json({ success: true, data: contactor });
});

export const dispenseContactor = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { quantity, reason } = req.body;
    const contactor = await ContactorModel.findById(id);
    if(!contactor) {
        return next(new ApiError(`Contactor with id ${id} not found`, 404));
    };
    if(contactor.stock < quantity) {
        return next(new ApiError(`Not enough stock available for contactor with id ${id}`, 400));
    };
    contactor.stock -= quantity;
    await contactor.save();
    const movement = await ContactorMovement.create({
        contactor: id,
        quantity,
        process: "صرف",
        reason: req.user.name,
        createdBy: req.user.name, // ← عرّفناها هن
        balanceBefore: contactor.stock + quantity,
        balanceAfter: contactor.stock,
    });
    res.status(200).json({ success: true, data: contactor });
});

export const getContactorMovements = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const movements = await ContactorMovement.find({ contactor: id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: movements.length, data: movements });
});

export const getAllContactorMovements = asyncHandler(async (req, res, next) => {
    const movements = await ContactorMovement.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: movements.length, data: movements });
});

export const AddStockContactor = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const contactor = await ContactorModel.findById(id);
    if (!contactor) {
        return next(new ApiError(`Contactor with id ${id} not found`, 404));
    }
    contactor.stock += quantity;
    await contactor.save();
    const movement = await ContactorMovement.create({
        contactor: id,
        quantity,
        process: "إضافة",
        reason: "إضافة مخزون",
        createdBy: req.user.name, // ← عرّفناها هن
        balanceBefore: contactor.stock - quantity,
        balanceAfter: contactor.stock,
    });
    res.status(200).json({ success: true, data: contactor, movement });
});
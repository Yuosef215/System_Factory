import asyncHandler from "express-async-handler";
import ApiError from "../../../utils/apiError.js";
import KeysModel from "../../models/Electric/KeysModel.js";
import KeysMonements from "../../models/Electric/KeysMovements.js";



export const cteateKey = asyncHandler(async (req, res, next) => {
    const { typeKey, color, not_assistant, stock } = req.body;

    const newKey = await KeysModel.create({
        typeKey,
        color,
        not_assistant,
        stock
    });
    if (!newKey) {
        return next(new ApiError("Key not created!", 400))
    };
    res.status(201).json({ success: true, data: newKey });
});

export const getKeyById = asyncHandler(async (req, res, next) => {
    const Key = await KeysModel.findByIdAndUpdate(req.params.id);
    if (!Key) {
        return next(new ApiError("Key not found", 404));
    };
    res.status(200).json({ success: true, data: Key });
});

export const getAllKeys = asyncHandler(async (req, res, next) => {
    const Keys = await KeysModel.find().limit(20);
    res.status(200).json({ success: true, data: Keys });
});

export const updateKey = asyncHandler(async (req, res, next) => {
    const { typeKey, color, not_assistant, stock } = req.body;
    const Key = await KeysModel.findByIdAndUpdate(req.params.id, {
        typeKey,
        color,
        not_assistant,
        stock
    }, { new: true });
    if (!Key) {
        return next(new ApiError("Key not found", 404))
    };
    res.status(200).json({ success: true, data: Key });
});

export const deleteKey = asyncHandler(async (req, res, next) => {
    const Key = await KeysModel.findByIdAndDelete(req.params.id);
    if (!Key) {
        return next(new ApiError("The Key Not found", 404))
    };
    res.status(200).json({ success: true, data: Key });
});

export const dispenseKeys = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { quantity, reason } = req.body;
    const Keys = await KeysModel.findById(id);
    if(!Keys) {
        return next(new ApiError(`Keys with id ${id} not found`, 404));
    };
    if(Keys.stock < quantity) {
        return next(new ApiError(`Not enough stock available for Keys with id ${id}`, 400));
    };
    Keys.stock -= quantity;
    await Keys.save();
    const movement = await KeysMonements.create({
        Keys: id,
        quantity,
        process: "صرف",
        reason: req.user.name,
        createdBy: req.user.name, // ← عرّفناها هن
        balanceBefore: Keys.stock + quantity,
        balanceAfter: Keys.stock,
    });
    res.status(200).json({ success: true, data: Keys });
});

export const getKeyMovements = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const movements = await KeysMonements.find({ contactor: id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: movements.length, data: movements });
});

export const getAllKeysMovements = asyncHandler(async (req, res, next) => {
    const movements = await KeysMonements.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: movements.length, data: movements });
});

export const AddStockKeys = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const Keys = await KeysModel.findById(id);
    if (!Keys) {
        return next(new ApiError(`Keys with id ${id} not found`, 404));
    }
    Keys.stock += quantity;
    await Keys.save();
    const movement = await KeysMovement.create({
        Keys: id,
        quantity,
        process: "إضافة",
        reason: "إضافة مخزون",
        createdBy: req.user.name,
        balanceBefore: Keys.stock - quantity,
        balanceAfter: Keys.stock,
    });
    res.status(200).json({ success: true, data: Keys, movement });
});
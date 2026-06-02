import asyncHandler from "express-async-handler";
import RollModel from "../../models/Mechanical/rollModel.js";
import ApiError from "../../../utils/apiError.js";
import rollMovement from "../../models/Mechanical/rollMovement.js";
import ActivityLogModel from "../../models/ActivityLog/ActivityLogModel.js";


// @desc    Create a new roll
// @route   POST /api/rolls
// @access  Private
export const createRoll = asyncHandler(async (req, res) => {
  const { companyName, rollCode, widthRoll, diameterRoll, stock } = req.body;
  const createdById = req.user.name;
  const roll = await RollModel.create({
    companyName,
    rollCode,
    widthRoll,
    diameterRoll,
    stock,
    createdBy: createdById,
  });

  await ActivityLogModel.create({
    user: req.user.name,
    action: `${req.user.name} created roll ${roll.rollCode}`,
    createdAt: new Date(),
  });
  res.status(201).json(roll);
});

export const getRolls = asyncHandler(async (req, res) => {
  const rolls = await RollModel.find();
  res.status(200).json(rolls);
});

export const getRollById = asyncHandler(async (req, res) => {
  const roll = await RollModel.findById(req.params.id);
  if (!roll) {
    return next(new ApiError("Roll not found", 404));
  }
  const movements = await rollMovement.find({ companyName: roll._id }).sort({ createdAt: -1 });
  res.status(200).json({ data: roll, movements });
});

export const dispenseRoll = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { quantity, reason } = req.body;
    const roll = await RollModel.findById(id);
    if(!roll) {
        return next(new ApiError(`Roll with id ${id} not found`, 404));
    };
    if(roll.stock < quantity) {
        return next(new ApiError(`Not enough stock available for roll with id ${id}`, 400));
    };
    const balanceBefore = roll.stock; // ← عرّفناها هن
    roll.stock -= quantity;
    await roll.save();
    // 4. سجل الحركة
    const createdBy = req.user.name; // ← عرّفناها هن    
    const movement = await rollMovement.create({
        roll: id,
        quantity,
        process: "صرف",
        reason,
        createdBy: createdBy,
        balanceBefore,
        balanceAfter: roll.stock,
    });
    await ActivityLogModel.create({
        user: req.user.name,
        action: `${req.user.name} صرف ${quantity} من الـ roll ${roll.rollCode}`,
        createdAt: new Date(),
    });
    res.status(200).json({ data: roll, movement });
});

export const getRollMovements = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const movements = await rollMovement
        .find({ roll: id })
        .sort({ createdAt: -1 });

    res.status(200).json({
        count: movements.length,
        data: movements,
    });
});

export const getMovementsByDate = asyncHandler(async (req, res, next) => {
    const { date } = req.query;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const movements = await rollMovement
        .find({  createdAt: { $gte: startOfDay, $lte: endOfDay } })
        .populate("roll", "rollCode companyName")
        .sort({ createdAt: -1 });

    res.status(200).json({
        count: movements.length,
        data: movements,
    });
});

export const addStockRoll = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { quantity } = req.body;

    const roll = await RollModel.findById(id);
    if (!roll) {
        return next(new ApiError(`Roll with id ${id} not found`, 404));
    };

    const balanceBefore = roll.stock;

    // زود على الـ stock
    roll.stock += quantity;
    await roll.save();

    // سجل الحركة
    const movement = await rollMovement.create({
        roll: id,
        quantity,
        process: "إضافة",
        reason: req.body.reason || "purchase",  // ← دايما purchase للإضافة
        createdBy: req.user.name,
        balanceBefore,
        balanceAfter: roll.stock,
    });

    await ActivityLogModel.create({
        user: req.user.name,
        action: `${req.user.name} أضاف ${quantity} إلى الـ roll ${roll.rollCode}`,
        createdAt: new Date(),
    });

    res.status(200).json({ data: roll, movement });
});
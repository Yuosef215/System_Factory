import asynchandler from "express-async-handler";
import BallBearingModel from "../../models/Mechanical/ballBearingModel.js";
import ApiError from "../../../utils/apiError.js";
import BallBearingMovementModel from "../../models/Mechanical/ballBearingMovement.js";

export const createBallBearing = asynchandler(async (req, res, next) => {
    const ballBearing = await BallBearingModel.create(req.body);
    if(!ballBearing) {
        return next(new ApiError(`Failed to create ball bearing`, 400));
    };
    res.status(201).json({ data: ballBearing });
});

export const dispenseBallBearing = asynchandler(async (req, res, next) => {
    const { id } = req.params;
    const { quantity, reason , createdBy } = req.body;
    const ballBearing = await BallBearingModel.findById(id);
    if(!ballBearing) {
        return next(new ApiError(`Ball bearing with id ${id} not found`, 404));
    };
    if(ballBearing.stock < 0) {
        return next(new ApiError(`Ball bearing with id ${id} is out of stock`, 400));
    };
    const balanceBefore = ballBearing.stock; // ← عرّفناها هن
    ballBearing.stock -= quantity;
    await ballBearing.save();
    // 4. سجل الحركة
    const movement = await BallBearingMovementModel.create({
        ballBearing: id,
        quantity,
        process: "صرف",
        reason,
        createdBy, // ← لو ما جاش createdBy، حط "unknown"
        balanceBefore,
        balanceAfter: ballBearing.stock,
    });
    res.status(200).json({ data: ballBearing, movement });
});

export const getBallBearingMovements = asynchandler(async (req, res, next) => {
    const { id } = req.params;

    const movements = await BallBearingMovementModel
        .find({ ballBearing: id })
        .sort({ createdAt: -1 });

    res.status(200).json({
        count: movements.length,
        data: movements,
    });
});

export const getMovementsByDate = asynchandler(async (req, res, next) => {
    const { date } = req.query;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const movements = await BallBearingMovementModel
        .find({ createdAt: { $gte: startOfDay, $lte: endOfDay } })
        .populate("ballBearing", "code innerdiameter outerdiameter brandtype")
        .sort({ createdAt: -1 });

    res.status(200).json({
        count: movements.length,
        data: movements,
    });
});

export const addStockBallBearing = asynchandler(async (req, res, next) => {
    const { id } = req.params;
    const { quantity, createdBy } = req.body;

    const ballBearing = await BallBearingModel.findById(id);
    if (!ballBearing) {
        return next(new ApiError(`Ball bearing with id ${id} not found`, 404));
    };

    const balanceBefore = ballBearing.stock;

    // زود على الـ stock
    ballBearing.stock += quantity;
    await ballBearing.save();

    // سجل الحركة
    const movement = await BallBearingMovementModel.create({
        ballBearing: id,
        quantity,
        process: "إضافة",
        reason: req.body.reason || "purchase",  // ← دايما purchase للإضافة
        createdBy,
        balanceBefore,
        balanceAfter: ballBearing.stock,
    });

    res.status(200).json({ data: ballBearing, movement });
});

export const deleteBallBearing = asynchandler(async (req, res, next) => {
    const { id } = req.params;

    const ballBearing = await BallBearingModel.findById(id);
    if (!ballBearing) {
        return next(new ApiError(`Ball bearing with id ${id} not found`, 404));
    }

    // منع الحذف لو في حركات عليه
    const movements = await BallBearingMovementModel.countDocuments({ ballBearing: id });
    if (movements > 0) {
        return next(new ApiError(`لا يمكن الحذف، يوجد ${movements} حركة مسجلة على هذا البيرينج`, 400));
    }

    await ballBearing.deleteOne();

    res.status(200).json({ message: "تم حذف البيرينج بنجاح" });
});


export const getAllBallBearings = asynchandler(async (req, res, next) => {
    const ballBearings = await BallBearingModel.find();
    res.status(200).json({ count: ballBearings.length, data: ballBearings });
});

export const getBallBearingById = asynchandler(async (req, res, next) => {
    const { id } = req.params;
    const ballBearing = await BallBearingModel.findById(id);
    if (!ballBearing) {
        return next(new ApiError(`Ball bearing with id ${id} not found`, 404));
    }
    const movements = await BallBearingMovementModel.find({ ballBearing: id }).sort({ createdAt: -1 });
    res.status(200).json({ data: ballBearing, movements });
});
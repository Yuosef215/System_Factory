import ApiError from "../../../utils/apiError.js";
import asynchandler from "express-async-handler";
import UserModel from "../../models/users/usersModel.js";
import bcrypt from 'bcryptjs';
import createToken from "../../../utils/createToken.js";
import jwt from "jsonwebtoken";
import ActivityLogModel from "../../models/ActivityLog/ActivityLogModel.js";


export const createUser = asynchandler(async (req, res, next) => {
    const { name, code, role, password } = req.body;
    
    if (!name || !code || !role || !password) {
        return next(new ApiError("Please enter all required fields", 400));
    }
    const hashPassword = await bcrypt.hash(password, 12);
    const user = new UserModel({ name, code, role, password: hashPassword });
    const token = createToken(user._id);
    await user.save();
    res.status(201).json({message: "User created successfully", data: user, token });
});

export const loginUser = asynchandler(async (req, res, next) => {
    const { code, password } = req.body;
    if (!code || !password) {
        return next(new ApiError("Please enter all required fields", 400));
    }
    const user = await UserModel.findOne({ code });
    if (!user) {
        return next(new ApiError("Invalid code or password", 401));
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new ApiError("Invalid code or password", 401));
    }
    const token = createToken(user._id);

    await ActivityLogModel.create({
        user: user.name,
        action: `${user.name} logged in`,
    });
    res.status(200).json({ message: "Login successful", data: user, token });
});

export const protect = asynchandler(async (req, res, next) => {
    // 1) check if token exsit, if exsit get it 
    // if(req.headers)
    let token;
    if (req.headers.authorization &&
        req.headers.authorization
    ) {
        token = req.headers.authorization.split(" ")[1]
    }
    if (!token) {
        return next(new ApiError("You are not login, please login to get access this route", 401))
    };
    // 2) verify token (vo change happens , expired token)
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // 3) check if user exsits 
    const currentUser = await UserModel.findById(decoded.userId);
    if (!currentUser) {
        return next(new ApiError("The user that belong to this token dose no longer exsit", 401))
    }
    // 4) check if user change his password after token created
    if (currentUser.passwordChangedAt) {
        const passwordChangedTimestamp = parseInt(
            currentUser.passwordChangedAt.getTime() / 1000,
            10
        );
        if (passwordChangedTimestamp > decoded.iat) {
            return next(new ApiError('User recently change password please login again', 401))
        }
    };
    req.user = currentUser;
    next();
});

export const allowedTo = (...roles) =>
     asynchandler(async (req, res , next) => {
         // 1) access roles
         // 2) access registred user
        if(!roles.includes(req.user.role)){
            return next(new ApiError("You are not allowed to access this route",403))
        }
        next();
        // 3)
});

export const getAllUsers = asynchandler(async (req, res, next) => {
    const users = await UserModel.find();
    res.status(200).json({ message: "Users retrieved successfully", result: users.length, data: users });
});

export const deleteUser = asynchandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
        return next(new ApiError("User not found", 404));
    }
    await ActivityLogModel.create({
        user: req.user.name,
        action: `He deleted the ${user.name}`,
    });
    res.status(200).json({ message: "User deleted successfully" });
});

export const updateUser = asynchandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, code, role, password } = req.body;
    const updateData = { name, code, role };
    if (password) {
        updateData.password = await bcrypt.hash(password, 12);
    }
    const user = await UserModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!user) {
        return next(new ApiError("User not found", 404));
    }
    res.status(200).json({ message: "User updated successfully", data: user });
});

export const notActiveUser = asynchandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await UserModel.findByIdAndUpdate(id, { active: false }, { new: true });
    if (!user) {
        return next(new ApiError("User not found", 404));
    }
    res.status(200).json({ message: "User deactivated successfully", data: user });
});

export const activeUser = asynchandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await UserModel.findByIdAndUpdate(id, { active: true }, { new: true });
    if (!user) {
        return next(new ApiError("User not found", 404));
    }
    res.status(200).json({ message: "User activated successfully", data: user });
});
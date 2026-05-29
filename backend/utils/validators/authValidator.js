import { check,body } from "express-validator";
import validatorMiddleware from "../../src/Middlewares/validatorMiddleware.js";
import UserModel from "../../src/models/users/usersModel.js";

export const createUserValidator = [
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('code')
        .notEmpty()
        .withMessage('Code is required')
        .isLength({ min: 3, max: 10 })
        .withMessage('Code must be between 3 and 10 characters')
        .custom(async (code) => {
            // Check if code already exists in the database
            const existingUser = await UserModel.findOne({ code });
            if (existingUser) {
                throw new Error('Code already in use');
            }
        }),
    body('role')
        .isIn([
            "developer",
            "warehouse_manager",
            "warehouse_worker",
            "production_manager",
            "maintenance_manager",
            "purchase_manager",
            "electricity_manager",
            "gm",
            "ceo",
            "viewer",
            "hr_manager"
        ])
        .withMessage('You must select a valid role'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    validatorMiddleware
];

export const loginValidator = [
    
    //  Email
    check('code')
        .notEmpty()
        .withMessage('Code required')
        .withMessage('Code must be between 5 and 10 characters'),
    // Password
    check('password')
        .notEmpty()
        .withMessage('Password required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),    
    validatorMiddleware
];
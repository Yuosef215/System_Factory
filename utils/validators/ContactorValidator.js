import { check, body } from "express-validator";
import validatorMiddleware from "../../src/Middlewares/validatorMiddleware";
import ContactorModel from "../../src/models/Electric/ContactorModel";


export const createContactor = [
    body('companyName')
        .notEmpty()
        .withMessage('The Company is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Company must be between 2 and 100 characters'),
    body('mass_kg')
        .notEmpty()
        .withMessage('Mass is required'),
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
            "viewer"
        ])
        .withMessage('You must select a valid role'),
    validatorMiddleware
];
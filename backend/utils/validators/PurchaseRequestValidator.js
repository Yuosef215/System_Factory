import { body, check } from "express-validator";
import validatorMiddleware from "../../src/Middlewares/validatorMiddleware.js";



export const createPurchaseRequestValidator = [
    check('specialized_engineer')
        .notEmpty()
        .withMessage('The Specialized Engineer is required'),
    validatorMiddleware
];
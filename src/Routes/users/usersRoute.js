import express from 'express';
import { 
    createUser ,
    loginUser,
    allowedTo
} from '../../Services/users/usersSevices.js';
import { 
    createUserValidator,
    loginValidator 
} from '../../../utils/validators/authValidator.js';


const router = express.Router();

router.route('/createUser').post(createUserValidator, createUser);
router.route('/login').post(loginValidator, loginUser);

export default router;
import express from 'express';
import { 
    createUser ,
    loginUser,
    allowedTo,
    getAllUsers,
    protect,
    updateUser,
    deleteUser,
    notActiveUser
} from '../../Services/users/usersSevices.js';
import { 
    createUserValidator,
    loginValidator 
} from '../../../utils/validators/authValidator.js';




const router = express.Router();

router.route('/createUser').post(createUserValidator, createUser);
router.route('/login').post(loginValidator, loginUser);
router.route('/getAllUsers').get(protect, allowedTo("developer","gm","ceo"), getAllUsers);
router.route('/updateUser/:id').put(protect, allowedTo("developer","gm","ceo"), updateUser);
router.route('/deleteUser/:id').delete(protect, allowedTo("developer","gm","ceo"), deleteUser);
router.route('/notActiveUser/:id').patch(protect, allowedTo("developer","gm","ceo"), notActiveUser);

export default router;
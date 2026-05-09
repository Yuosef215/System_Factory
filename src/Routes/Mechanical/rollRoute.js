import express from 'express';
import { createRoll, getRolls,getRollById,dispenseRoll,getMovementsByDate,getRollMovements, addStockRoll } from '../../Services/Mechanical/rollServices.js';
import { allowedTo, protect } from '../../Services/users/usersSevices.js';


const router = express.Router();

// @route   POST /api/rolls
// @desc    Create a new roll
// @access  Private
router.post('/createRoll', protect, allowedTo('developer', 'warehouse_manager'), createRoll);
router.get('/getRolls', protect, allowedTo('developer', 'warehouse_manager'), getRolls);
router.get('/getRollById/:id', protect, allowedTo('developer', 'warehouse_manager'), getRollById);
router.patch('/dispenseRoll/:id', protect, allowedTo('developer', 'warehouse_manager'), dispenseRoll);
router.get('/getRollMovements/:id', protect, allowedTo('developer', 'warehouse_manager'), getRollMovements);
router.get('/getMovementsByDate', protect, allowedTo('developer', 'warehouse_manager'), getMovementsByDate);
router.patch('/addStockRoll/:id', protect, allowedTo('developer', 'warehouse_manager'), addStockRoll);

export default router;
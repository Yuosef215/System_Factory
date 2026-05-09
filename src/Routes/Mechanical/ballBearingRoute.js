
import express from 'express';
import {
    createBallBearing,
    dispenseBallBearing,
    getBallBearingMovements,
    getMovementsByDate,
    addStockBallBearing,
    deleteBallBearing,
    getAllBallBearings,
    getBallBearingById

} from '../../Services/Mechanical/ballBearingService.js';

import { allowedTo, protect } from '../../Services/users/usersSevices.js';


const router = express.Router();

// ✅ Static routes الأول
router.route('/create')
    .post(protect, allowedTo('developer', 'warehouse_manager'), createBallBearing);

router.route('/all_bearings')
    .get(protect, allowedTo('developer', 'warehouse_manager', 'viewer', 'ceo', 'gm', 'warehouse_worker'), getAllBallBearings);

router.route('/movements')
    .get(protect, allowedTo('developer', 'warehouse_manager', 'viewer', 'ceo', 'gm', 'warehouse_worker'), getMovementsByDate);

// ✅ Dynamic routes بعدين
router.route('/dispense/:id')
    .patch(protect, allowedTo('developer', 'warehouse_manager', 'warehouse_worker'), dispenseBallBearing);

router.route('/movements/:id')
    .get(protect, allowedTo('developer', 'warehouse_manager', 'viewer', 'ceo', 'gm', 'warehouse_worker'), getBallBearingMovements);

router.route('/add-stock/:id')
    .patch(protect, allowedTo('developer', 'warehouse_manager', 'warehouse_worker'), addStockBallBearing);

router.route('/:id')
    .get(protect, allowedTo('developer', 'warehouse_manager', 'viewer', 'ceo', 'gm', 'warehouse_worker'), getBallBearingById)
    .delete(protect, allowedTo('developer', 'warehouse_manager'), deleteBallBearing);


export default router;
import express from 'express';
import { 
    createHose,
    getHose,
    getAllHoses,
    updateHose,
    dispenseHose,
    AddstockHose,
    getHosesMovements,
    getAllHoseMovements
} from '../../Services/Electric/electricalHose';

import { protect, allowedTo } from '../../Services/users/usersSevices';

const router = express.Router();

router.post("/create_hose",protect,allowedTo("warehouse_worker","developer"),createHose);
router.get("/", protect, allowedTo("warehouse_worker","developer","warehouse_manager","electricity_manager","ceo"), getAllHoses);
router.get("/allMovements", protect, allowedTo("warehouse_worker","developer","warehouse_manager","ceo"), getAllHoseMovements);
router.patch("/dispense/:id", protect, allowedTo("warehouse_worker","developer","warehouse_manager"), dispenseHose);
router.patch("/addStock/:id", protect, allowedTo("warehouse_worker","developer","warehouse_manager"), AddstockHose);
router.get("/movements/:id", protect, allowedTo("warehouse_worker","developer","warehouse_manager","ceo"), getHosesMovements);
router.get("/:id", protect, allowedTo("warehouse_worker","developer","warehouse_manager"), getHose);
router.put("/:id", protect, allowedTo("developer","warehouse_manager"), updateHose);

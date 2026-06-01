import express from 'express';

import { 
    cteateCable,
    getAllCables,
    getCable,
    updateCable,
    getAllCableMovements,
    getCablesMovements,
    dispenseCable,   // ← أضف
    AddstockCable,
} from '../../Services/Electric/CablesServices.js';

import { protect, allowedTo } from '../../Services/users/usersSevices.js';



const router = express.Router();

router.post("/createCable",protect , allowedTo("warehouse_worker","developer"),cteateCable);
router.get("/",protect,allowedTo("warehouse_worker","developer","warehouse_manager","electricity_manager"),getAllCables);
router.get("/allMovemnts",protect,allowedTo("warehouse_worker","developer","warehouse_manager"));
router.patch("/dispense/:id",protect,allowedTo("warehouse_worker","developer","warehouse_manager"));
router.patch("/addStock/:id",protect,allowedTo("warehouse_worker","developer","warehouse_manager"));
router.get("/movements/:id", protect, allowedTo("warehouse_worker","developer","warehouse_manager"), getCablesMovements);
router.get("/allMovements", protect, allowedTo("warehouse_worker","developer","warehouse_manager"), getAllCableMovements);
router.patch("/dispense/:id", protect, allowedTo("warehouse_worker","developer","warehouse_manager"), dispenseCable);
router.patch("/addStock/:id", protect, allowedTo("warehouse_worker","developer","warehouse_manager"), AddstockCable);
router.get("/:id", protect, allowedTo("warehouse_worker","developer","warehouse_manager"), getCable);
router.put("/:id", protect, allowedTo("developer","warehouse_manager"), updateCable);


export default router;
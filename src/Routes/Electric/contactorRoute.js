import express from 'express';
import {
    ctreateContactor,
    getContactor,
    getAllContactors,
    updateContactor,
    deleteContactor,
    dispenseContactor,
    getContactorMovements,
    AddStockContactor,
    getAllContactorMovements
} from '../../Services/Electric/ContactorServices.js';

import { protect, allowedTo } from '../../Services/users/usersSevices.js';

const router = express.Router();

router.post("/createContactor", protect, allowedTo("warehouse_worker","developer"), ctreateContactor);
router.get("/", protect, allowedTo("warehouse_worker","developer","warehouse_manager","electricity_manager"), getAllContactors);
router.get("/allMovements", protect, allowedTo("warehouse_worker","developer","warehouse_manager"), getAllContactorMovements);
router.patch("/dispense/:id", protect, allowedTo("warehouse_worker","developer","warehouse_manager"), dispenseContactor);
router.patch("/addStock/:id", protect, allowedTo("warehouse_worker","developer","warehouse_manager"), AddStockContactor);
router.get("/movements/:id", protect, allowedTo("warehouse_worker","developer","warehouse_manager"), getContactorMovements);
router.get("/:id", protect, allowedTo("warehouse_worker","developer","warehouse_manager"), getContactor);
router.put("/:id", protect, allowedTo("developer","warehouse_manager"), updateContactor);
router.delete("/:id", protect, allowedTo("developer","warehouse_manager"), deleteContactor);

export default router;
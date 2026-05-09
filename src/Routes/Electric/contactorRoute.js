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

import { protect } from '../../Services/users/usersSevices.js';

const router = express.Router();

router.post("/createContactor", protect, ctreateContactor);
router.get("/", protect, getAllContactors);
router.get("/allMovements", protect, getAllContactorMovements); // ✅ قبل /:id
router.patch("/dispense/:id", protect, dispenseContactor);     // ✅ قبل /:id
router.patch("/addStock/:id", protect, AddStockContactor);     // ✅ قبل /:id
router.get("/movements/:id", protect, getContactorMovements);  // ✅ قبل /:id
router.get("/:id", protect, getContactor);
router.put("/:id", protect, updateContactor);
router.delete("/:id", protect, deleteContactor);

export default router;
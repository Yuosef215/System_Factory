// ============================================================
// purchaseRequestRoute.js
// ============================================================
import express from "express";
import { protect, allowedTo } from "../../Services/users/usersSevices.js";
import {
  createPurchaseRequest,
  getAllPurchaseRequests,
  getPurchaseRequestById,
  updateRequestStatus,
  updatePurchaseRequest,
  deletePurchaseRequest,
} from "../../Services/purchases/PurchaseRequestService.js";

const router = express.Router();

router.post("/create", protect, allowedTo("developer", "purchase_manager"), createPurchaseRequest);
router.get("/", protect, allowedTo("developer", "purchase_manager", "gm", "ceo", "warehouse_manager"), getAllPurchaseRequests);
router.get("/:id", protect, allowedTo("developer", "purchase_manager", "gm", "ceo", "warehouse_manager"), getPurchaseRequestById);
router.patch("/:id/status", protect, allowedTo("developer", "gm", "ceo"), updateRequestStatus);
router.put("/:id", protect, allowedTo("developer", "purchase_manager"), updatePurchaseRequest);
router.delete("/:id", protect, allowedTo("developer", "purchase_manager"), deletePurchaseRequest);

export default router;



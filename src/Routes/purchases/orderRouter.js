// ============================================================
// purchaseOrderRoute.js
// ============================================================
import express from "express";
import { protect, allowedTo } from "../../Services/users/usersSevices.js";
import {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  confirmReceivedItems,
} from "../../Services/purchases/PurchaseOrderService.js";

const orderRouter = express.Router();

orderRouter.post("/create", protect, allowedTo("developer", "purchase_manager"), createPurchaseOrder);
orderRouter.get("/", protect, allowedTo("developer", "purchase_manager", "gm", "ceo", "warehouse_manager"), getAllPurchaseOrders);
orderRouter.get("/:id", protect, allowedTo("developer", "purchase_manager", "gm", "ceo", "warehouse_manager"), getPurchaseOrderById);
orderRouter.patch("/:id/confirm-items", protect, allowedTo("developer", "purchase_manager", "warehouse_manager"), confirmReceivedItems);

export default orderRouter;



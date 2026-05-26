// ============================================================
// inspectionRoute.js
// ============================================================
import express from "express";
import { protect, allowedTo } from "../../Services/users/usersSevices.js";
import {
  createInspectionReport,
  getAllInspectionReports,
  getInspectionReportById,
  approveInspectionReport,
  markAddedToInventory,
  getPendingInventoryAdditions,
} from "../../Services/Purchases/InspectionReportService.js";

const inspectionRouter = express.Router();

inspectionRouter.post("/create", protect, allowedTo("developer", "warehouse_manager", "warehouse_worker"), createInspectionReport);
inspectionRouter.get("/", protect, allowedTo("developer", "warehouse_manager", "purchase_manager", "gm", "ceo"), getAllInspectionReports);
inspectionRouter.get("/pending-inventory", protect, allowedTo("developer", "warehouse_manager", "warehouse_worker"), getPendingInventoryAdditions);
inspectionRouter.get("/:id", protect, allowedTo("developer", "warehouse_manager", "purchase_manager"), getInspectionReportById);
inspectionRouter.patch("/:id/approve", protect, allowedTo("developer", "warehouse_manager", "gm", "ceo"), approveInspectionReport);
inspectionRouter.patch("/:id/add-to-inventory", protect, allowedTo("developer", "warehouse_manager", "warehouse_worker"), markAddedToInventory);

export default inspectionRouter;
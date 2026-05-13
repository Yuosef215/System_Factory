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


// ============================================================
// priceOfferRoute.js
// ============================================================
import express from "express";
import { protect, allowedTo } from "../../Services/users/usersSevices.js";
import {
  createPriceOffer,
  getAllPriceOffers,
  getPriceOfferById,
  getOffersByRequest,
  approvePriceOffer,
  rejectPriceOffer,
} from "../../Services/Purchases/PriceOfferService.js";

const offerRouter = express.Router();

offerRouter.post("/create", protect, allowedTo("developer", "purchase_manager"), createPriceOffer);
offerRouter.get("/", protect, allowedTo("developer", "purchase_manager", "gm", "ceo"), getAllPriceOffers);
offerRouter.get("/request/:requestId", protect, allowedTo("developer", "purchase_manager", "gm", "ceo"), getOffersByRequest);
offerRouter.get("/:id", protect, allowedTo("developer", "purchase_manager", "gm", "ceo"), getPriceOfferById);
offerRouter.patch("/:id/approve", protect, allowedTo("gm", "ceo", "developer"), approvePriceOffer);
offerRouter.patch("/:id/reject", protect, allowedTo("gm", "ceo", "developer"), rejectPriceOffer);

export { offerRouter };


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
} from "../../Services/Purchases/PurchaseOrderService.js";

const orderRouter = express.Router();

orderRouter.post("/create", protect, allowedTo("developer", "purchase_manager"), createPurchaseOrder);
orderRouter.get("/", protect, allowedTo("developer", "purchase_manager", "gm", "ceo", "warehouse_manager"), getAllPurchaseOrders);
orderRouter.get("/:id", protect, allowedTo("developer", "purchase_manager", "gm", "ceo", "warehouse_manager"), getPurchaseOrderById);
orderRouter.patch("/:id/confirm-items", protect, allowedTo("developer", "purchase_manager", "warehouse_manager"), confirmReceivedItems);

export { orderRouter };


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

export { inspectionRouter };
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
} from "../../Services/purchases/PriceOfferService.js";

const offerRouter = express.Router();

offerRouter.post("/create", protect, allowedTo("developer", "purchase_manager"), createPriceOffer);
offerRouter.get("/", protect, allowedTo("developer", "purchase_manager", "gm", "ceo"), getAllPriceOffers);
offerRouter.get("/request/:requestId", protect, allowedTo("developer", "purchase_manager", "gm", "ceo"), getOffersByRequest);
offerRouter.get("/:id", protect, allowedTo("developer", "purchase_manager", "gm", "ceo"), getPriceOfferById);
offerRouter.patch("/:id/approve", protect, allowedTo("gm", "ceo", "developer"), approvePriceOffer);
offerRouter.patch("/:id/reject", protect, allowedTo("gm", "ceo", "developer"), rejectPriceOffer);

export default offerRouter;



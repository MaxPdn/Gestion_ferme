import { Router } from "express";
import * as financeController from "../controllers/financeController.js";
import { protect } from "../middlewares/middleware.js";

const router = Router();

// Toutes les routes de finance sont protégées
router.use(protect);

router.post("/", financeController.createTransaction);
router.get("/", financeController.getAllTransactions);
router.get("/stats", financeController.getFinanceStats);
router.get("/campaign/:campaignId", financeController.getCampaignTransactions);
router.delete("/:id", financeController.deleteTransaction);

export default router;

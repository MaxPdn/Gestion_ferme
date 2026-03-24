import express from "express";
import * as campaignController from "../controllers/campaign.controller.js";
import {getDashboardStats} from "../services/campaign.service.js";

const router = express.Router();

router.get("/dashboard-stats",getDashboardStats);
// CRUD
router.post("/", campaignController.create);
router.get("/", campaignController.getAll);
router.get("/:id", campaignController.getOne);
router.put("/:id", campaignController.update);
router.delete("/:id", campaignController.remove);

// 🔥 métier
router.post("/:id/losses", campaignController.addLoss);
router.post("/:id/sales", campaignController.addSale);
router.patch("/:id/status", campaignController.updateStatus);

export default router;
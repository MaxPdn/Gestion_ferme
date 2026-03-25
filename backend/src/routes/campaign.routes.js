import express from "express";
import * as campaignController from "../controllers/campaign.controller.js";

const router = express.Router();

// CRUD
router.post("/", campaignController.create);
router.get("/", campaignController.getAll);
router.get("/search", campaignController.getByName); // Route spécifique AVANT :id
router.get("/:id", campaignController.getOne);
router.put("/:id", campaignController.update);
router.delete("/:id", campaignController.remove);

// 🔥 métier
router.post("/:id/losses", campaignController.addLoss);
router.post("/:id/sales", campaignController.addSale);
router.patch("/:id/status", campaignController.updateStatus);

export default router;
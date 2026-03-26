import { Router } from "express";
import {
    create,
    getOne,
    getAll,
    getStats,
    remove,
    addWeightController,
    addHealthEventController,
    detectAnomalyController,
    updateStatusController,
    getQRCode
} from "../controllers/animal.controller.js";

const router = Router();

/*-----------------------------------------
Routes
------------------------------------------*/
router.get("/", getAll);
router.post("/", create);
router.get("/:id", getOne);
router.get("/:id/stats", getStats);
router.get("/:id/qrcode", getQRCode);
router.delete("/:id/delete", remove)
router.post("/:id/weight", addWeightController);
router.post("/:id/health", addHealthEventController);
router.get("/:id/anomaly", detectAnomalyController);
router.patch("/:id/status", updateStatusController);



export default router;
import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import stockRoutes from "./stock.routes.js";
import campaignRoutes from "./campaign.routes.js";
import departmentRoutes from "./department.routes.js";



const router = Router();

router.get("/health", (req, res) => res.json({ data: { status: "ok" } })); 

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/stocks", stockRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/departments", departmentRoutes);


export default router;

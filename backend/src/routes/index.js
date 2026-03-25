import { Router } from "express";
import animalRoutes from "./animal.route.js";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import healthRoutes from "./healthRoutes.js";
import campaignRoutes from './campaign.routes.js'
import departmentRoutes from './department.routes.js'
import financeRoutes from './financeRoutes.js'

const router = Router();

router.get("/health", (req, res) => res.json({ data: { status: "ok" } }));
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/health-records", healthRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/departments', departmentRoutes);
router.use('/finance', financeRoutes);


router.use("/animals", animalRoutes);
export default router;

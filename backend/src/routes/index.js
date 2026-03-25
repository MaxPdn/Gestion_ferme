import { Router } from "express";
import animalRoutes from "./animal.route.js";

const router = Router();
router.get("/health", (req, res) => res.json({ data: { status: "ok" } }));


router.use("/animals", animalRoutes);
export default router;

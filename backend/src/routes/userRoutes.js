import express from "express";
import { createUser, getUsers, updateUser, deleteUser } from "../controllers/userController.js";
import { protect, isAdmin } from "../middlewares/middleware.js";

const router = express.Router();

// Toutes ces routes sont protégées et réservées à l'Admin
router.use(protect, isAdmin);

router.post("/", createUser);
router.get("/", getUsers);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
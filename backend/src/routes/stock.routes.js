import express from "express";
import {
    createProduct,
    updateProduct,
    deleteProduct,
    addStock,
    removeStock,
    getStockStatus,
    getAllStocks
} from "../controllers/stock.controller.js";

const router = express.Router();

// Produits
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Entrée
router.post("/products/:id/add", addStock);

// Sortie
router.post("/products/:id/remove", removeStock);

// Stock d’un produit
router.get("/products/:id/status", getStockStatus);

// Tous les stocks
router.get("/stocks", getAllStocks);

export default router;
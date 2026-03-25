import stockService from "../services/stock.service.js";

//reponse de creation de produit
export const createProduct = async (req, res) => {
    try {
        const product = await stockService.createProduct(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Mise à jour d'un produit
export const updateProduct = async (req, res) => {
    try {
        const product = await stockService.updateProduct(req.params.id, req.body);
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Suppression d'un produit
export const deleteProduct = async (req, res) => {
    try {
        await stockService.deleteProduct(req.params.id);
        res.status(200).json({ message: "Produit supprimé avec succès" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//reponse d'ajout de stock
export const addStock = async (req, res) => {
    try {
        const movement = await stockService.addStock(
            req.params.id,
            req.body.quantity,
            req.body
        );
        res.status(200).json(movement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//reponse de retrait de stock
export const removeStock = async (req, res) => {
    try {
        const movement = await stockService.removeStock(
            req.params.id,
            req.body.quantity,
            req.body
        );
        res.status(200).json(movement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//reponse de status de stock
export const getStockStatus = async (req, res) => {
    try {
        const data = await stockService.getStockStatus(req.params.id);
        res.status(200).json(data);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

//reponse de tous les stocks
export const getAllStocks = async (req, res) => {
    try {
        const stocks = await stockService.getAllStocks();
        res.status(200).json(stocks);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
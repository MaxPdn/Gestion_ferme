import Product from "../models/Product.js";
import StockCurrent from "../models/StockCurrent.js";
import StockMovement from "../models/StockMouvement.js";

class StockService {
    //Creation de produit
    async createProduct(data){
        const { quantity, ...productData } = data;
        const product = await Product.create({ ...productData, quantity: quantity || 0 });
        await StockCurrent.create({
            product: product._id,
            quantityAvailable: quantity || 0
        })
        return product
    }

    // Mise à jour d'un produit
    async updateProduct(productId, data) {
        const { quantity, ...productData } = data;
        const product = await Product.findByIdAndUpdate(productId, { ...productData, quantity: quantity || 0 }, { new: true });
        if (!product) throw new Error("Produit non trouvé");
        
        // Mettre à jour aussi le stock actuel si la quantité a été modifiée
        if (quantity !== undefined) {
            await StockCurrent.findOneAndUpdate(
                { product: productId },
                { quantityAvailable: quantity, lastUpdate: Date.now() }
            );
        }
        
        return product;
    }

    // Suppression d'un produit et de ses stocks associés
    async deleteProduct(productId) {
        await Product.findByIdAndDelete(productId);
        await StockCurrent.findOneAndDelete({ product: productId });
        await StockMovement.deleteMany({ product: productId });
        return { message: "Produit supprimé avec succès" };
    }

    //Ajout de stock
     async  addStock(productId, quantity, data = {}){
        const mouvement = await StockMovement.create({
            product: productId,
            type: "entry",
            quantity,
            ...data
        })
        await this.updateStock(productId, quantity)
        return mouvement
     }

     //Mise a jour de stock
      async updateStock(productId, quantityChange) {
        const stock = await StockCurrent.findOneAndUpdate(
            { product: productId },
            {
                $inc: { quantityAvailable: quantityChange },
                lastUpdate: Date.now()
            },
            { new: true }
        );
        return stock;
    }

    //Obtention de status de stock
    async getStockStatus(productId) {
        const stock = await StockCurrent.findOne({ product: productId })
            .populate("product");

        if (!stock) throw new Error("Produit non trouvé");

        const isCritical =
            stock.quantityAvailable <= stock.product.alertThreshold;

        return {
            stock,
            isCritical
        };
    }
     async getAllStocks() {
        return await StockCurrent.find().populate("product");
    }
}
export default new StockService();
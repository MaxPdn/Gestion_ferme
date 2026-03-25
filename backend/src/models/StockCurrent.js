import mongoose from "mongoose";

// Modèle pour le stock actuel d'un produit
const stockCurrentSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        unique: true
    },
    quantityAvailable: {
        type: Number,
        default: 0
    },
    lastUpdate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model("StockCurrent", stockCurrentSchema);

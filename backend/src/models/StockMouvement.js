import mongoose from "mongoose";

// Modèle pour les mouvements de stock (entrée/sortie)
const stockMovementSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    type: {
        type: String,
        enum: ["entry", "exit", "adjustment"],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    reference: String,
    responsible: String,
    note: String
}, { timestamps: true });

export default mongoose.model("StockMovement", stockMovementSchema);

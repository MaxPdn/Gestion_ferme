import mongoose from 'mongoose';

const movementSchema = new mongoose.Schema({
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  foodName: String, 
  type: { type: String, enum: ['Entrée', 'Sortie'], required: true },
  quantity: { type: Number, required: true },
  unit: String,
  target: String, // ex: "Lot A - Bovins"
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Movement', movementSchema);
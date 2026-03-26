import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Fourrage', 'Concentrés', 'Céréales', 'Protéines', 'Compléments'], 
    default: 'Fourrage' 
  },
  price: { type: Number, default: 0 },
  supplier: String,
  stock: { type: Number, default: 0 },
  unit: { type: String, default: 'kg' },
  minThreshold: { type: Number, default: 100 }
}, { timestamps: true });

export default mongoose.model('Food', foodSchema);
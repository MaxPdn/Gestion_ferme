import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
name: {
    type: String,
    required: true
},
category:{
    type: String,
    enum: ["aliment", "medicament", "materiel"],
    required: true
},
unit: {
    type: String,
    required: true
},
alertThreshold: {
    type: Number,
    required: true
},
quantity: {
    type: Number,
    required: true
},
departement: {
    type: String
} 
}, {timestamps: true})

export default mongoose.model('Product', productSchema);
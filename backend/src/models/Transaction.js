import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["dépense", "recette"],
    required: [true, "Le type de transaction (dépense ou recette) est obligatoire"]
  },
  category: {
    type: String,
    enum: ["alimentation", "santé", "main-d'oeuvre", "vente", "équipement", "autre"],
    required: [true, "La catégorie est obligatoire"]
  },
  amount: {
    type: Number,
    required: [true, "Le montant est obligatoire"],
    min: [0, "Le montant ne peut pas être négatif"]
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

// Index pour faciliter les recherches par campagne et par date
transactionSchema.index({ campaign: 1, date: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;

import Transaction from "../models/Transaction.js";
import Campaign from "../models/Campaign.model.js";

// @desc    Enregistrer une transaction
// @route   POST /api/finance
export const createTransaction = async (req, res) => {
  try {
    const { type, category, amount, description, date, campaignId } = req.body;

    const transaction = await Transaction.create({
      type,
      category,
      amount,
      description,
      date: date || Date.now(),
      campaign: campaignId || null,
      createdBy: req.user._id // Supposant que l'utilisateur est authentifié
    });

    res.status(201).json({
      status: "success",
      data: transaction
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message
    });
  }
};

// @desc    Récupérer toutes les transactions
// @route   GET /api/finance
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("campaign", "name")
      .populate("createdBy", "name")
      .sort({ date: -1 });

    res.status(200).json({
      status: "success",
      results: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message
    });
  }
};

// @desc    Récupérer les transactions d'une campagne
// @route   GET /api/finance/campaign/:campaignId
export const getCampaignTransactions = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const transactions = await Transaction.find({ campaign: campaignId })
      .sort({ date: -1 });

    res.status(200).json({
      status: "success",
      results: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message
    });
  }
};

// @desc    Supprimer une transaction
// @route   DELETE /api/finance/:id
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction non trouvée" });
    }

    res.status(204).json({
      status: "success",
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message
    });
  }
};

// @desc    Obtenir les statistiques financières globales
// @route   GET /api/finance/stats
export const getFinanceStats = async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);

    const result = {
      recettes: stats.find(s => s._id === "recette")?.total || 0,
      dépenses: stats.find(s => s._id === "dépense")?.total || 0
    };

    result.balance = result.recettes - result.dépenses;

    res.status(200).json({
      status: "success",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message
    });
  }
};

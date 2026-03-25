import HealthRecord from '../models/HealthRecord.js';

// @desc    Ajouter un record de santé à une campagne
// @route   POST /api/health/:campaignId
export const createHealthRecord = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { type, title, details, medication, severity, withdrawalPeriod, date, nextFollowUpDate } = req.body;

    const newRecord = await HealthRecord.create({
      campaign: campaignId,
      type,
      title,
      details,
      medication,
      severity,
      withdrawalPeriod,
      nextFollowUpDate,
      date: date || Date.now()
    });

    res.status(201).json({
      status: 'success',
      data: newRecord
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// @desc    Récupérer l'historique de santé d'une campagne
// @route   GET /api/health/:campaignId
export const getCampaignHealthHistory = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const history = await HealthRecord.find({ campaign: campaignId })
      .sort({ date: -1 }); // Plus récent au plus ancien

    res.status(200).json({
      status: 'success',
      results: history.length,
      data: history
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// @desc    Supprimer un record de santé
// @route   DELETE /api/health/:id
export const deleteHealthRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({ message: 'Record non trouvé' });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

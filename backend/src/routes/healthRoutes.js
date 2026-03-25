import express from 'express';
import { 
  createHealthRecord, 
  getCampaignHealthHistory, 
  deleteHealthRecord 
} from '../controllers/healthController.js';

const router = express.Router();

// Routes pour la santé d'une campagne spécifique
router.route('/:campaignId')
  .post(createHealthRecord)
  .get(getCampaignHealthHistory);

// Route pour supprimer un record spécifique
router.route('/:id')
  .delete(deleteHealthRecord);

export default router;

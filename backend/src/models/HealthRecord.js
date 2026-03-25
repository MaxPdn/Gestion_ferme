import mongoose from 'mongoose';

const healthRecordSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: [true, 'Une campagne doit être associée à ce record']
  },
  type: {
    type: String,
    enum: ['maladie', 'vaccination', 'observation'],
    required: [true, 'Le type de record est obligatoire']
  },
  title: {
    type: String,
    required: [true, 'Un titre ou nom de traitement est requis'],
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  details: {
    type: String,
    required: [true, 'Veuillez fournir des observations terrain']
  },
  medication: {
    name: String,
    dosage: String,
    stockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock'
    }
  },
  severity: {
    type: String,
    enum: ['faible', 'modérée', 'critique'],
    default: 'faible'
  },
  withdrawalPeriod: {
    type: Number, // Délai d'attente avant vente/consommation (en jours)
    default: 0
  },
  nextFollowUpDate: {
    type: Date, // Date du prochain rappel ou visite de suivi
    default: null
  }
}, { timestamps: true });

export default mongoose.model('HealthRecord', healthRecordSchema);

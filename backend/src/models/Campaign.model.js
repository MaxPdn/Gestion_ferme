import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom de la campagne est obligatoire'],
      trim: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, 'Le département est obligatoire'],
    },

    startDate: {
      type: Date,
      required: [true, 'La date de début est obligatoire'],
    },

    endDate: {
      type: Date,
    },

    objective: {
      type: Number,
      required: true,
    },

    initialCount: {
      type: Number,
      required: [true, 'Le nombre initial de sujets est obligatoire'],
      min: [0, 'Le nombre initial ne peut pas être négatif'],
    },

    currentCount: {
      type: Number,
      default: function() {
      return this.initialCount;
    },
      min: [0, 'L\'effectif actuel ne peut pas être négatif'],
    },

    losses: {
      type: Number,
      default: 0,
    },

    sold: {
      type: Number,
      default: 0,
    },

    budget: {
      type: Number,
      required: [true, 'Le budget initial est obligatoire'],
      default: 100,
    },

    status: {
      type: String,
      enum: ["preparation", "active", "completed"],
      default: "preparation",
    },
  },
  { timestamps: true },
);

// --- 🔒 UNICITÉ ---
// Empêche d'avoir deux campagnes avec le même nom dans le même département
campaignSchema.index({ name: 1, department: 1 }, { unique: true });

// --- 🔥 LOGIQUE AUTOMATIQUE ---
campaignSchema.virtual("statusDynamic").get(function () {
  const now = new Date();
  const start = this.startDate ? new Date(this.startDate) : null;
  const end = this.endDate ? new Date(this.endDate) : null;

  // Si l'effectif tombe à zéro, la campagne est forcément terminée
  if (this.currentCount <= 0) return "completed";
  if (!start || now < start) return "preparation";
  if (end && now > end) return "completed";

  return "active";
});

// Hook pour initialiser currentCount
campaignSchema.pre("save", function () {
  if (this.isNew && (this.currentCount === undefined || this.currentCount === null)) {
    this.currentCount = this.initialCount;
  }
});

// Ajoute ceci à ton campaignSchema
campaignSchema.virtual("mortalityRate").get(function () {
  if (!this.initialCount || this.initialCount === 0) return 0;
  return ((this.losses / this.initialCount) * 100).toFixed(2);
});

// Seuil d'alerte (tu peux le rendre configurable par département plus tard)
const MORTALITY_THRESHOLD = 5; 

campaignSchema.virtual("hasAlert").get(function () {
  return parseFloat(this.mortalityRate) >= MORTALITY_THRESHOLD;
});

campaignSchema.set("toJSON", { virtuals: true });
campaignSchema.set("toObject", { virtuals: true }); // Important si tu fais des console.log ou manipules des objets simples

export default mongoose.model("Campaign", campaignSchema);


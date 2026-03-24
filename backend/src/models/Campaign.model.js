import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required : true,
    },

    startDate: {
      type: Date,
      required: true,
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
      required: true,
    },

    currentCount: {
      type: Number,
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
      default: 0,
    },

    status: {
      type: String,
      enum: ["preparation", "active", "completed"],
      default: "preparation",
    },
  },
  { timestamps: true },
);

// 🔥 logique automatique
campaignSchema.virtual("statusDynamic").get(function () {
  const now = new Date();

  const start = this.startDate ? new Date(this.startDate) : null;
  const end = this.endDate ? new Date(this.endDate) : null;

  if (this.currentCount <= 0) return "completed";

  if (!start) return "preparation";

  if (now < start) return "preparation";

  if (end && now > end) return "completed";

  return "active";
});

campaignSchema.pre("save", function () {
  if (this.isNew) {
    this.currentCount = this.initialCount;
  }
});
campaignSchema.set("toJSON", { virtuals: true });
export default mongoose.model("Campaign", campaignSchema);

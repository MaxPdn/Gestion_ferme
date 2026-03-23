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
campaignSchema.pre("save", function () {
  if (this.isNew) {
    this.currentCount = this.initialCount;
  }
});

export default mongoose.model("Campaign", campaignSchema);

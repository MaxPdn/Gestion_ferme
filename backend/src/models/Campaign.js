import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
    name: String,
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },
    startDate: Date,
    objective: Number,
    initialCount: Number,
    losses: Number,
    sold: Number,
    budget: Number,
    status: String,
    currentCount: Number
}, {
    timestamps: true
});

export const Campaign = mongoose.model("Campaign", campaignSchema);
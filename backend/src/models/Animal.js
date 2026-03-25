import mongoose from "mongoose";

const { Schema } = mongoose;

/*-----------------------------------------
WEIGHT SCHEMA : un sous-modèle pour stocker les poids
------------------------------------------*/
const weightSchema = new mongoose.Schema({
    value: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

/*-----------------------------------------
HEALTH EVENT SCHEMA : Historique médical de l’animal
------------------------------------------*/
const healthEventSchema = new mongoose.Schema({
    type: {
        type: String, // vaccin, maladie, traitement
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    date: {
        type: Date,
        default: Date.now
    }
});

/*-----------------------------------------
ANIMAL SCHEMA
------------------------------------------*/
const animalSchema = new mongoose.Schema(
    {
        campaign: {
            type: Schema.Types.ObjectId,
            ref: "Campaign",
            required: true
        },

        code: {
            type: String,
            required: true,
            trim: true
        },

        qrCode: {
            type: String,
            unique: true
        },

        department: {
            type: Schema.Types.ObjectId,
            ref: "Department",
            required: true
        },

        birthDate: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["vivant", "mort", "vendu"],
            default: "vivant"
        },

        weights: [weightSchema],

        healthHistory: [healthEventSchema],

        notes: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);


export const Animal = mongoose.model("Animal", animalSchema);
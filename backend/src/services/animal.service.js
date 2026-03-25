import { Animal } from "../models/Animal.js";
import { Campaign } from "../models/Campaign.js";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";

/*-----------------------------------------------------------
    CREATE ANIMAL
-----------------------------------------------------------*/
export async function createAnimal({ campaign, code, birthDate, species }) {

    if (!campaign) {
        const err = new Error("campaign is required");
        err.statusCode = 400;
        throw err;
    }

    if (!code || code.trim().length < 2) {
        const err = new Error("code is required");
        err.statusCode = 400;
        throw err;
    }

    const animal = await Animal.create({
        campaign,
        code: code.trim(),
        birthDate,
        species,
        qrCode: uuidv4()
    });

    return animal;
}

/*-----------------------------------------------------------
    ADD WEIGHT
-----------------------------------------------------------*/
export async function addWeight({ animalId, weight }) {

    if (!weight || weight <= 0) {
        const err = new Error("weight must be > 0");
        err.statusCode = 400;
        throw err;
    }

    const animal = await Animal.findById(animalId);

    if (!animal) {
        const err = new Error("Animal not found");
        err.statusCode = 404;
        throw err;
    }

const updatedAnimal = await Animal.findByIdAndUpdate(
    animalId,
    {
        $push: { weights: { value: weight } }
    },
    { new: true } )

return updatedAnimal;
}

/*-----------------------------------------------------------
    ADD HEALTH EVENT
-----------------------------------------------------------*/
export async function addHealthEvent({ animalId, type, description }) {

    if (!type) {
        const err = new Error("type is required");
        err.statusCode = 400;
        throw err;
    }

    const animal = await Animal.findById(animalId);

    if (!animal) {
        const err = new Error("Animal not found");
        err.statusCode = 404;
        throw err;
    }

    animal.healthHistory.push({
        type,
        description
    });

    await animal.save();

    return animal;
}

/*-----------------------------------------------------------
    GET ONE ANIMAL
-----------------------------------------------------------*/
export async function getAnimal(animalId) {

    const animal = await Animal.findById(animalId)
        .populate("campaign");

    if (!animal) {
        const err = new Error("Animal not found");
        err.statusCode = 404;
        throw err;
    }

    return animal;
}

/*-----------------------------------------------------------
    GET ANIMAL STATS
-----------------------------------------------------------*/
export async function getAnimalStats(animalId) {

    const animal = await Animal.findById(animalId);

    if (!animal) {
        const err = new Error("Animal not found");
        err.statusCode = 404;
        throw err;
    }

const weights = [...animal.weights].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
);

    if (weights.length === 0) {
        return {
            currentWeight: 0,
            averageWeight: 0,
            growth: 0
        };
    }

    const total = weights.reduce((sum, w) => sum + w.value, 0);
    const average = total / weights.length;

    const currentWeight = weights[weights.length - 1].value;

    const firstWeight = weights[0].value;
    const growth = currentWeight - firstWeight;
    const growthRate = firstWeight > 0 
    ? (growth / firstWeight) * 100 
    : 0;

    return {
        currentWeight,
        averageWeight: average,
        growth,
        growthRate
    };
}


/*-----------------------------------------------------------
    DETECT ANOMALY (IMPROVED)
-----------------------------------------------------------*/
export async function detectAnomaly(animalId) {
    
    const animal = await Animal.findById(animalId);
    
    if (!animal) {
        const err = new Error("Animal not found");
        err.statusCode = 404;
        throw err;
    }

    const weights = [...animal.weights].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
);

    // Pas assez de données
    if (!weights || weights.length < 2) {
        return {
            anomaly: false,
            level: "info",
            message: "Not enough data",
            data: null
        };
    }

    // Trier par date (sécurité)
    const sorted = weights.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    const last = sorted[sorted.length - 1].value;
    const prev = sorted[sorted.length - 2].value;
    const first = sorted[0].value;

    const diff = last - prev;
    const totalGrowth = last - first;
    const growthRate = (totalGrowth / first) * 100;

    // PERTE DE POIDS
    if (diff < 0) {
        return {
            anomaly: true,
            level: "critical",
            message: "Weight loss detected",
            data: {
                lastWeight: last,
                previousWeight: prev,
                difference: diff,
                growthRate
            }
        };
    }

    // CROISSANCE FAIBLE
    if (diff < 0.1) {
        return {
            anomaly: true,
            level: "warning",
            message: "Low growth detected",
            data: {
                lastWeight: last,
                previousWeight: prev,
                difference: diff,
                growthRate
            }
        };
    }

    // NORMAL
    return {
        anomaly: false,
        level: "normal",
        message: "Normal growth",
        data: {
            lastWeight: last,
            previousWeight: prev,
            difference: diff,
            growthRate
        }
    };
}

/*-----------------------------------------------------------
    GENERATE QRCODE
-----------------------------------------------------------*/
export async function generateQRCode(animalId) {

    const url = `http://localhost:5173/animals/${animalId}`;

    const qr = await QRCode.toDataURL(url);

    return qr;
}

/*-----------------------------------------------------------
    GET ALL ANIMALS (WITH FILTERS)
-----------------------------------------------------------*/
export async function getAnimals({ status, species, campaign, search }) {

    const query = {};

    // 🟢 FILTRES
    if (status) {
        query.status = status;
    }

    if (species) {
        query.species = species;
    }

    if (campaign) {
        query.campaign = campaign;
    }

    // 🔍 SEARCH (code)
    if (search) {
        query.code = { $regex: search, $options: "i" };
    }

    const animals = await Animal.find(query)
        .populate("campaign")
        .sort({ createdAt: -1 });

    return animals;
}

/*-----------------------------------------------------------
    UPDATE STATUS
-----------------------------------------------------------*/
export async function updateAnimalStatus({ animalId, status }) {

    if (!["vivant", "mort", "vendu"].includes(status)) {
        const err = new Error("Invalid status");
        err.statusCode = 400;
        throw err;
    }

    const animal = await Animal.findByIdAndUpdate(
        animalId,
        { status },
        { new: true }
    );

    if (!animal) {
        const err = new Error("Animal not found");
        err.statusCode = 404;
        throw err;
    }

    return animal;
}


/*-----------------------------------------------------------
    DELETE ANIMAL
-----------------------------------------------------------*/
export const deleteAnimal = async (id) => {

  const animal = await Animal.findById(id);

  if (!animal) {
    throw new Error("NOT_FOUND");
  }

  await Animal.findByIdAndDelete(id);

  return true;
};
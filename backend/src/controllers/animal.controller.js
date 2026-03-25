import {
    createAnimal,
    addWeight,
    addHealthEvent,
    getAnimal,
    getAnimals,
    getAnimalStats,
    updateAnimalStatus,
    detectAnomaly,
    deleteAnimal,
    generateQRCode
} from "../services/animal.service.js";

/*-----------------------------------------------------------
    CREATE
-----------------------------------------------------------*/
export async function create(req, res, next) {
    try {
        const animal = await createAnimal(req.body ?? {});
        return res.status(201).json({ animal });
    } catch (err) {
        return next(err);
    }
}

/*-----------------------------------------------------------
    ADD WEIGHT
-----------------------------------------------------------*/
export async function addWeightController(req, res, next) {
    try {
        const animal = await addWeight({
            animalId: req.params.id,
            weight: req.body.weight
        });

        return res.status(200).json({ animal });
    } catch (err) {
        return next(err);
    }
}

/*-----------------------------------------------------------
    ADD HEALTH EVENT
-----------------------------------------------------------*/
export async function addHealthEventController(req, res, next) {
    try {
        const animal = await addHealthEvent({
            animalId: req.params.id,
            type: req.body.type,
            description: req.body.description
        });

        return res.status(200).json({ animal });
    } catch (err) {
        return next(err);
    }
}

/*-----------------------------------------------------------
    GET ONE
-----------------------------------------------------------*/
export async function getOne(req, res, next) {
    try {
        const animal = await getAnimal(req.params.id);
        return res.status(200).json({ animal });
    } catch (err) {
        return next(err);
    }
}

/*-----------------------------------------------------------
    GET STATS
-----------------------------------------------------------*/
export async function getStats(req, res, next) {
    try {
        const stats = await getAnimalStats(req.params.id);
        return res.status(200).json({ stats });
    } catch (err) {
        return next(err);
    }
}

/*-----------------------------------------------------------
    DETECT ANOMALY
-----------------------------------------------------------*/
export async function detectAnomalyController(req, res, next) {
    try {
        const result = await detectAnomaly(req.params.id);
        
        return res.status(200).json(result);
    } catch (err) {
        return next(err);
    }
}


/*-----------------------------------------------------------
    Qr Code
-----------------------------------------------------------*/
export async function getQRCode(req, res, next) {
    try {
        const qr = await generateQRCode(req.params.id);
        return res.status(200).json({ qr });
    } catch (err) {
        return next(err);
    }
}

/*-----------------------------------------------------------
    GET ALL
-----------------------------------------------------------*/
export async function getAll(req, res, next) {
    try {
        const animals = await getAnimals(req.query);

        return res.status(200).json({ animals });
    } catch (err) {
        return next(err);
    }
}

/*-----------------------------------------------------------
    UPDATE STATUS
-----------------------------------------------------------*/
export async function updateStatusController(req, res, next) {
    try {
        const animal = await updateAnimalStatus({
            animalId: req.params.id,
            status: req.body.status
        });

        return res.status(200).json({ animal });

    } catch (err) {
        return next(err);
    }
}

/*-----------------------------------------------------------
    DELETE ANIMAL
-----------------------------------------------------------*/
export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteAnimal(id);

    res.status(200).json({
      message: "Animal supprimé avec succès"
    });

  } catch (err) {

    if (err.message === "NOT_FOUND") {
      return res.status(404).json({
        message: "Animal introuvable"
      });
    }

    console.error("deleteAnimal error:", err);

    res.status(500).json({
      message: "Erreur serveur"
    });
  }
};
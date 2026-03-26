import 'dotenv/config';
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import router from './routes/index.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { getFoods, saveFood, distributeFood } from './controllers/foodController.js';
// Importe le modèle de mouvement en haut
import Movement from './models/Movement.js';
import Food from './models/Food.js';



const app = express();
app.use(express.json());

app.use(
  cors(),
);

app.use("/api", router);
app.get('/api/foods', getFoods);
app.post('/api/foods', saveFood);
app.post('/api/foods/distribute', distributeFood);
// Ajoute la route pour récupérer les mouvements
app.get('/api/movements', async (req, res) => {
  try {
    const movements = await Movement.find().sort({ date: -1 }).limit(10);
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Dans ton fichier de routes ou contrôleur
app.put('/api/foods/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    // Sécurité : on retire l'ID du body pour ne pas perturber MongoDB
    delete data._id; 
    delete data.id;

    const updatedFood = await Food.findByIdAndUpdate(
      req.params.id, 
      data, 
      { new: true, runValidators: true } // runValidators vérifie les types
    );

    if (!updatedFood) return res.status(404).json({ message: "Aliment non trouvé" });
    res.json(updatedFood);
  } catch (error) {
    console.log("Erreur Mongoose :", error.message);
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/foods/:id', async (req, res) => {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: "Supprimé" });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Erreur interne du serveur",
  });
});


app.use(notFound);
app.use(errorHandler);

export default app;

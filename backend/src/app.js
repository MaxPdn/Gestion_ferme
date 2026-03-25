import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import router from "./routes/index.js";
import "dotenv/config";

const app = express();
app.use(express.json());

app.use(
  cors(),
);

app.use("/api", router);

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Erreur interne du serveur",
  });
});

export default app;

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import router from "./routes/index.js";
import "dotenv/config";
import campaignRoutes from "./routes/campaign.routes.js";
import departmentRoutes from "./routes/department.routes.js";

const app = express();
app.use(express.json());

app.use(
  cors(),
);

app.use("/api", router);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/departments", departmentRoutes);

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Erreur interne du serveur",
  });
});

export default app;

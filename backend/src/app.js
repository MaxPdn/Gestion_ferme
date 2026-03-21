import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import "dotenv/config";
import campaignRoutes from "./routes/campaign.route.js";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use("/api", router);
app.use("/api/campaigns", campaignRoutes);

export default app;

import app from "./app.js";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./db/connect.js";

dotenv.config();
console.log("Ma variable MONGO_URL est :", process.env.MONGO_URL);
const port = process.env.PORT ?? 7000;

app.use(cors());
await connectDB();

app.listen(port, () => {
  console.log(`✅L'application express a démarré sur le port ${port}`);
});

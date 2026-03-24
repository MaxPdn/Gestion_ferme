import app from "./app.js";
import cors from "cors";
import { connectDB } from "./db/connect.js";
import 'dotenv/config';

const port = process.env.PORT ?? 7000;

app.use(cors());
try {
  await connectDB();
  console.log('✅La connection a la base de donnée est établie');
} catch (error) {
  console.log('❌Erreur de connection à la base de donnée');
  console.log(error.message);
}

app.listen(port, () => {
  console.log(`✅L'application express a démarré sur le port ${port}`);
});

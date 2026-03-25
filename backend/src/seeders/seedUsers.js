import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, { dbName: process.env.DB_NAME });
        console.log("✅ Connecté à MongoDB pour le seeding");

        // Supprimer les utilisateurs existants pour repartir de zéro (optionnel)
        // await User.deleteMany({});

        const usersToCreate = [
            {
                username: "Admin Principal",
                email: "admin@farm.com",
                password: "adminpassword",
                role: "Admin"
            },
            {
                username: "Jean Gestionnaire",
                email: "jean@farm.com",
                password: "password123",
                role: "Gestionnaire"
            },
            {
                username: "Marie Agent",
                email: "marie@farm.com",
                password: "password123",
                role: "Agent terrain"
            },
            {
                username: "Pierre Agent",
                email: "pierre@farm.com",
                password: "password123",
                role: "Agent terrain"
            }
        ];

        for (const userData of usersToCreate) {
            const userExists = await User.findOne({ email: userData.email });
            if (!userExists) {
                await User.create(userData);
                console.log(`👤 Utilisateur créé : ${userData.username} (${userData.role})`);
            } else {
                console.log(`ℹ️ L'utilisateur ${userData.email} existe déjà`);
            }
        }

        console.log("\n🚀 Seeding terminé avec succès !");
        console.log("----------------------------------");
        console.log("Admin : admin@farm.com / adminpassword");
        console.log("Gestionnaire : jean@farm.com / password123");
        console.log("Agent : marie@farm.com / password123");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Erreur lors du seeding:", error);
        process.exit(1);
    }
};

seedUsers();
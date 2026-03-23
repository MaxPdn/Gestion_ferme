import mongoose from  'mongoose'

// Connexion à la base de données
export async function connectDB() {
    const MONGO_URL = process.env.MONGO_URL;
    const DB_NAME = process.env.DB_NAME ?? 'farm_db'
    
    // l'url de connection doit exister
    if(!MONGO_URL){
        throw new Error('Attention , URL mongo manquante, veuillez vérifier')
    }

    try {
        await mongoose.connect(MONGO_URL, { dbName: DB_NAME });
        console.log('✅ Connexion à MongoDB réussie');
    } catch (error) {
        throw error;
    }

}
import mongoose from  'mongoose'

export async function connectDB() {
    const MONGO_URL = process.env.MONGO_URL;
    const DB_NAME = process.env.DB_NAME ?? 'farm_db'
    
    // l'url de connection doit exister
    if(!MONGO_URL){
        throw new Error('Attention , URL mongo manquante, veuillez vérifier')
    }

    await mongoose.connect(MONGO_URL, {dbName: DB_NAME});
    console.log('✅La connection a la base de donnée est établie');
    
}
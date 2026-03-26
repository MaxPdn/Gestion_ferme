import Food from '../models/Food.js';
import Movement from '../models/Movement.js';

// Récupérer tous les aliments
export const getFoods = async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ajouter ou Modifier un aliment
export const saveFood = async (req, res) => {
  const { id, ...data } = req.body;
  try {
    if (id) {
      const updated = await Food.findByIdAndUpdate(id, data, { new: true });
      return res.json(updated);
    }
    const newFood = new Food(data);
    await newFood.save();
    res.status(201).json(newFood);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Distribuer (Mise à jour du stock)
export const distributeFood = async (req, res) => {
  const { foodId, quantity, target } = req.body;
  
  try {
    const food = await Food.findById(foodId);
    if (!food) return res.status(404).json({ message: "Aliment introuvable" });
    if (food.stock < quantity) return res.status(400).json({ message: "Stock insuffisant" });

    // Mise à jour du stock
    food.stock -= quantity;
    await food.save();

    // Création du mouvement historique
    const movement = new Movement({
      foodId: food._id,
      foodName: food.name,
      type: 'Sortie',
      quantity,
      unit: food.unit,
      target: target
    });
    await movement.save();

    res.json({ food, movement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer l'historique des mouvements
export const getMovements = async (req, res) => {
  try {
    const movements = await Movement.find().sort({ date: -1 }).limit(20);
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
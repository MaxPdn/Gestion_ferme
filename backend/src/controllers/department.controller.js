// backend/controllers/department.controller.js
import Department from "../models/Department.model.js";

// 📥 GET /departments
export const getDepartments = async (req, res) => {
  try {
    const depts = await Department.find().sort({ createdAt: -1 });
    res.status(200).json(depts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des départements" });
  }
};

// ➕ POST /departments
export const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Le nom du département est requis" });
    }

    const existing = await Department.findOne({ name: name.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Département existant" });
    }

    const dept = await Department.create({ name: name.trim().toLowerCase() });
    res.status(201).json(dept);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de la création du département" });
  }
};   

// ✏️ PUT /departments/:id
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Le nom du département est requis" });
    }

    const dept = await Department.findByIdAndUpdate(
      id,
      { name: name.trim().toLowerCase() },
      { new: true }
    );

    if (!dept) return res.status(404).json({ message: "Département introuvable" });

    res.status(200).json(dept);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour du département" });
  }
};

// ❌ DELETE /departments/:id
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const dept = await Department.findByIdAndDelete(id);
    if (!dept) return res.status(404).json({ message: "Département introuvable" });

    res.status(200).json({ message: "Département supprimé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de la suppression du département" });
  }
};
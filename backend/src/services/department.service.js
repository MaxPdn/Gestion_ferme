import Department from "../models/department.model.js";

// ➕ créer
export const createDepartment = async (data) => {
  const existing = await Department.findOne({ name: data.name });

  if (existing) {
    throw new Error("Department already exists");
  }

  return await Department.create(data);
};

// 📥 récupérer tous
export const getDepartments = async () => {
  return await Department.find().sort({ createdAt: -1 });
};

// 🔍 récupérer un
export const getDepartmentById = async (id) => {
  return await Department.findById(id);
};

// ✏️ update
export const updateDepartment = async (id, data) => {
  return await Department.findByIdAndUpdate(id, data, { new: true });
};

// ❌ delete
export const deleteDepartment = async (id) => {
  return await Department.findByIdAndDelete(id);
};
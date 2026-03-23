import axios from "axios";

const API = "http://localhost:7000/api/departments";

// 📥 récupérer tous les départements
export const getDepartments = () => axios.get(API);

// ➕ créer un nouveau département
export const createDepartment = (data) => axios.post(API, data);

// ✏️ mettre à jour un département existant
export const updateDepartment = (id, data) => axios.put(`${API}/${id}`, data);

// 🗑️ supprimer un département
export const deleteDepartment = (id) => axios.delete(`${API}/${id}`);

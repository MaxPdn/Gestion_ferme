import {api} from './api.js'

export async function getAnimal(id) {
    const res = await api.get(`/animals/${id}`);
    return res.data.animal;
}

export async function getStats(id) {
    const res = await api.get(`/animals/${id}/stats`);
    console.log(res.data.stats);
    return res.data.stats;
}

export async function getAnomaly(id) {
    const res = await api.get(`/animals/${id}/anomaly`);
    return res.data;
}

export async function getQRCode(id) {
    const res = await api.get(`/animals/${id}/qrcode`);
    return res.data.qr;
}

export async function addWeight(id, weight) {
  const res = await api.post(`/animals/${id}/weight`, {
    weight
  });
  return res.data.animal;
}

export async function addHealth(id, data) {
  const res = await api.post(`animals/${id}/health`, data);
  return res.data.animal;
}

export async function getAnimals(params = {}) {
  const res = await api.get(`/animals`, {
    params
  });
  return res.data.animals;
}

export async function createAnimal(data) {
  const res = await api.post(`/animals`, data);
  return res.data.animal;
}

export async function updateStatus(id, status) {
  const res = await api.patch(`/animals/${id}/status`, { status });
  return res.data.animal;
}

export const deleteAnimal = async (id) => {
  try {
    const res = await api.delete(`/animals/${id}/delete`);
    return res.data; 
  } catch (err) {
    console.error("Erreur suppression animal :", err.response?.data || err.message);
    throw err;
  }
};
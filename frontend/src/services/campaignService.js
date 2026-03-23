import axios from "axios";

const API = "http://localhost:5000/api/campaigns";

export const getCampaigns = () => axios.get(API);
export const getCampaign = (id) => axios.get(`${API}/${id}`);
export const createCampaign = (data) => axios.post(API, data);

export const addLoss = (id, quantity) =>
  axios.post(`${API}/${id}/losses`, { quantity });

export const addSale = (id, quantity) =>
  axios.post(`${API}/${id}/sales`, { quantity });

export const updateStatus = (id, status) =>
  axios.patch(`${API}/${id}/status`, { status });
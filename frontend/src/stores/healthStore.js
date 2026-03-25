import { defineStore } from 'pinia';
import axios from 'axios';

export const useHealthStore = defineStore('health', {
  state: () => ({
    records: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchHealthRecords(campaignId) {
      this.loading = true;
      try {
        const response = await axios.get(`http://localhost:7000/api/health-records/${campaignId}`);
        this.records = response.data.data;
        this.error = null;
      } catch (err) {
        this.error = err.response?.data?.message || 'Erreur lors du chargement des données';
      } finally {
        this.loading = false;
      }
    },

    async addHealthRecord(campaignId, recordData) {
      this.loading = true;
      try {
        const response = await axios.post(`http://localhost:7000/api/health-records/${campaignId}`, recordData);
        this.records.unshift(response.data.data);
        this.error = null;
        return true;
      } catch (err) {
        this.error = err.response?.data?.message || "Erreur lors de l'ajout du record";
        return false;
      } finally {
        this.loading = false;
      }
    },

    async deleteRecord(recordId) {
      try {
        await axios.delete(`http://localhost:7000/api/health-records/${recordId}`);
        this.records = this.records.filter(r => r._id !== recordId);
        return true;
      } catch (err) {
        this.error = err.response?.data?.message || 'Erreur lors de la suppression';
        return false;
      }
    }
  }
});

import { defineStore } from 'pinia';
import axios from 'axios';

export const useFinanceStore = defineStore('finance', {
  state: () => ({
    transactions: [],
    stats: {
      recettes: 0,
      dépenses: 0,
      balance: 0
    },
    loading: false,
    error: null,
  }),

  actions: {
    getHeaders() {
      const token = localStorage.getItem('token');
      return {
        headers: { Authorization: `Bearer ${token}` }
      };
    },

    async fetchAllTransactions() {
      this.loading = true;
      try {
        const response = await axios.get('http://localhost:7000/api/finance', this.getHeaders());
        this.transactions = response.data.data;
        this.error = null;
      } catch (err) {
        this.error = err.response?.data?.message || 'Erreur lors du chargement des transactions';
      } finally {
        this.loading = false;
      }
    },

    async fetchFinanceStats() {
      try {
        const response = await axios.get('http://localhost:7000/api/finance/stats', this.getHeaders());
        this.stats = response.data.data;
      } catch (err) {
        console.error('Erreur stats finance:', err);
      }
    },

    async addTransaction(transactionData) {
      this.loading = true;
      try {
        const response = await axios.post('http://localhost:7000/api/finance', transactionData, this.getHeaders());
        this.transactions.unshift(response.data.data);
        await this.fetchFinanceStats();
        this.error = null;
        return true;
      } catch (err) {
        this.error = err.response?.data?.message || "Erreur lors de l'ajout de la transaction";
        return false;
      } finally {
        this.loading = false;
      }
    },

    async deleteTransaction(id) {
      try {
        await axios.delete(`http://localhost:7000/api/finance/${id}`, this.getHeaders());
        this.transactions = this.transactions.filter(t => t._id !== id);
        await this.fetchFinanceStats();
        return true;
      } catch (err) {
        this.error = err.response?.data?.message || 'Erreur lors de la suppression';
        return false;
      }
    }
  }
});

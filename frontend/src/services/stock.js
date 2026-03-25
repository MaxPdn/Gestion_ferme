/**
 * Service pour les appels API liés aux stocks
 * Utilise Axios pour communiquer avec le backend (ES6)
 */
import axios from 'axios';

// URL de base de l'API backend (configurée sur le port 7000)
const API_URL = 'http://localhost:7000/api/stocks';

// Récupérer le token d'authentification depuis le localStorage
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export default {
    /**
     * Récupérer tous les produits en stock avec leur état actuel
     */
    async getAllStocks() {
        return await axios.get(`${API_URL}/stocks`, getAuthHeaders());
    },

    /**
     * Créer un nouveau produit en stock
     * @param {Object} productData - Données du produit (nom, unité, seuil d'alerte, etc.)
     */
    async createProduct(productData) {
        return await axios.post(`${API_URL}/products`, productData, getAuthHeaders());
    },

    /**
     * Mettre à jour un produit existant
     * @param {String} productId - ID du produit
     * @param {Object} productData - Nouvelles données du produit
     */
    async updateProduct(productId, productData) {
        return await axios.put(`${API_URL}/products/${productId}`, productData, getAuthHeaders());
    },

    /**
     * Supprimer un produit et ses stocks associés
     * @param {String} productId - ID du produit
     */
    async deleteProduct(productId) {
        return await axios.delete(`${API_URL}/products/${productId}`, getAuthHeaders());
    },

    /**
     * Ajouter du stock pour un produit existant (Entrée)
     * @param {String} productId - ID du produit
     * @param {Number} quantity - Quantité à ajouter
     * @param {Object} data - Métadonnées (référence, responsable, note)
     */
    async addStock(productId, quantity, data = {}) {
        return await axios.post(`${API_URL}/products/${productId}/add`, { quantity, ...data }, getAuthHeaders());
    },

    /**
     * Retirer du stock pour un produit existant (Sortie)
     * @param {String} productId - ID du produit
     * @param {Number} quantity - Quantité à retirer
     * @param {Object} data - Métadonnées (référence, responsable, note)
     */
    async removeStock(productId, quantity, data = {}) {
        return await axios.post(`${API_URL}/products/${productId}/remove`, { quantity, ...data }, getAuthHeaders());
    },

    /**
     * Obtenir le statut détaillé d'un produit (vérification du seuil critique)
     * @param {String} productId - ID du produit
     */
    async getStockStatus(productId) {
        return await axios.get(`${API_URL}/products/${productId}/status`, getAuthHeaders());
    }
};

/**
 * Store Pinia pour la gestion centralisée de l'état des stocks
 * Utilise ES6 pour la définition du store
 */
import { defineStore } from 'pinia';
import stockService from '../services/stock.js';

export const useStockStore = defineStore('stock', {
    // État du store (Data)
    state: () => ({
        stocks: [],          // Liste des produits en stock (populée via getAllStocks)
        loading: false,      // État de chargement global
        error: null,         // Message d'erreur éventuel
        selectedProduct: null // Produit sélectionné pour l'affichage détaillé
    }),

    // Actions du store (Logique métier)
    actions: {
        /**
         * Charger tous les stocks depuis le backend
         */
        async fetchAllStocks() {
            this.loading = true;
            this.error = null;
            try {
                const response = await stockService.getAllStocks();
                // response.data contient la liste des stocks
                this.stocks = response.data;
            } catch (err) {
                this.error = "Erreur lors de la récupération des stocks : " + (err.response?.data?.message || err.message);
                console.error(this.error);
            } finally {
                this.loading = false;
            }
        },

        /**
         * Créer un nouveau produit
         * @param {Object} productData - Données du nouveau produit
         */
        async addProduct(productData) {
            this.loading = true;
            try {
                await stockService.createProduct(productData);
                // On recharge la liste après ajout pour avoir des données à jour
                await this.fetchAllStocks();
            } catch (err) {
                this.error = "Erreur lors de la création du produit : " + (err.response?.data?.message || err.message);
                throw err; // On relance pour gestion dans le composant
            } finally {
                this.loading = false;
            }
        },

        /**
         * Mettre à jour un produit
         * @param {String} productId - ID du produit
         * @param {Object} productData - Nouvelles données
         */
        async updateProduct(productId, productData) {
            this.loading = true;
            try {
                await stockService.updateProduct(productId, productData);
                await this.fetchAllStocks();
            } catch (err) {
                this.error = "Erreur lors de la mise à jour : " + (err.response?.data?.message || err.message);
                throw err;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Supprimer un produit
         * @param {String} productId - ID du produit
         */
        async deleteProduct(productId) {
            this.loading = true;
            try {
                await stockService.deleteProduct(productId);
                await this.fetchAllStocks();
            } catch (err) {
                this.error = "Erreur lors de la suppression : " + (err.response?.data?.message || err.message);
                throw err;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Enregistrer une entrée de stock
         * @param {String} productId - ID du produit
         * @param {Number} quantity - Quantité ajoutée
         * @param {Object} details - Métadonnées de l'opération
         */
        async recordEntry(productId, quantity, details) {
            this.loading = true;
            try {
                await stockService.addStock(productId, quantity, details);
                // Mise à jour de la liste
                await this.fetchAllStocks();
            } catch (err) {
                this.error = "Erreur lors de l'ajout de stock : " + (err.response?.data?.message || err.message);
                throw err;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Enregistrer une sortie de stock
         * @param {String} productId - ID du produit
         * @param {Number} quantity - Quantité retirée
         * @param {Object} details - Métadonnées de l'opération
         */
        async recordExit(productId, quantity, details) {
            this.loading = true;
            try {
                await stockService.removeStock(productId, quantity, details);
                // Mise à jour de la liste
                await this.fetchAllStocks();
            } catch (err) {
                this.error = "Erreur lors du retrait de stock : " + (err.response?.data?.message || err.message);
                throw err;
            } finally {
                this.loading = false;
            }
        }
    }
});

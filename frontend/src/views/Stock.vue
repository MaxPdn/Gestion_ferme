<template>
  <!-- Conteneur principal avec fond gris clair (bg-slate-50) -->
  <div class="p-8 bg-slate-50 min-h-screen">
    <!-- Header de la page -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-800">Gestion des Stocks</h1>
        <p class="text-slate-500 mt-1 font-medium">Suivi en temps réel des produits et mouvements de stock</p>
      </div>
      
      <!-- Actions globales -->
      <div class="flex items-center gap-3">
        <button 
          @click="openAddProductModal"
          class="bg-[#1e293b] hover:bg-slate-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-slate-800/20 transition-all active:scale-95 font-bold uppercase tracking-wide text-sm"
        >
          <Package :size="20" />
          Nouveau Produit
        </button>
      </div>
    </div>

    <!-- Section des filtres et recherche -->
    <div class="flex flex-col md:flex-row gap-4 mb-8">
      <!-- Barre de recherche -->
      <div class="relative flex-1 group">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" :size="20" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Rechercher un produit..." 
          class="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm"
        />
      </div>

      <!-- Filtre par catégorie -->
      <div class="relative w-full md:w-64 group">
        <Filter class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" :size="18" />
        <select 
          v-model="categoryFilter"
          class="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none appearance-none cursor-pointer shadow-sm font-medium text-slate-700"
        >
          <option value="">Toutes les catégories</option>
          <option value="aliment">Aliments</option>
          <option value="medicament">Médicaments</option>
          <option value="materiel">Matériels</option>
        </select>
      </div>

      <!-- Filtre par statut -->
      <div class="relative w-full md:w-64 group">
        <Filter class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" :size="18" />
        <select 
          v-model="statusFilter"
          class="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none appearance-none cursor-pointer shadow-sm font-medium text-slate-700"
        >
          <option value="">Tous les statuts</option>
          <option value="bonne">Bonne</option>
          <option value="critique">Critique</option>
        </select>
      </div>
    </div>

    <!-- Tableau des stocks -->
    <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
      <div v-if="stockStore.loading && stockStore.stocks.length === 0" class="p-12 text-center text-slate-500 font-medium">
        Chargement des données...
      </div>
      
      <table v-else class="w-full text-left border-collapse">
        <thead class="bg-[#1e293b] text-white">
          <tr>
            <th class="px-8 py-5 text-xs font-bold uppercase tracking-widest">Produit</th>
            <th class="px-8 py-5 text-xs font-bold uppercase tracking-widest">Catégorie</th>
            <th class="px-8 py-5 text-xs font-bold uppercase tracking-widest">Quantité</th>
            <th class="px-8 py-5 text-xs font-bold uppercase tracking-widest">Unité</th>
            <th class="px-8 py-5 text-xs font-bold uppercase tracking-widest">Seuil</th>
            <th class="px-8 py-5 text-xs font-bold uppercase tracking-widest">Statut</th>
            <th class="px-8 py-5 text-xs font-bold uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="item in filteredStocks" :key="item._id" class="hover:bg-slate-50/50 transition-colors group">
            <td class="px-8 py-5">
              <span class="font-bold text-slate-700">{{ item.product.name }}</span>
            </td>
            <td class="px-8 py-5">
              <span class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                {{ item.product.category }}
              </span>
            </td>
            <td class="px-8 py-5 font-bold" :class="isCritical(item) ? 'text-red-500' : 'text-slate-700'">
              {{ item.quantityAvailable }}
            </td>
            <td class="px-8 py-5 text-slate-500 font-medium">
              {{ item.product.category === 'aliment' ? item.product.unit : '-' }}
            </td>
            <td class="px-8 py-5 text-slate-500 font-medium">
              {{ item.product.alertThreshold }}
            </td>
            <td class="px-8 py-5">
              <span 
                :class="[
                  'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border',
                  isCritical(item) ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                ]"
              >
                {{ isCritical(item) ? 'critique' : 'bonne' }}
              </span>
            </td>
            <td class="px-8 py-5 text-right">
              <div class="flex justify-end gap-2">
                <button @click="openEditProductModal(item)" title="Modifier produit" class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                  <Pencil :size="18" />
                </button>
                <button @click="confirmDelete(item)" title="Supprimer produit" class="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                  <Trash2 :size="18" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredStocks.length === 0">
            <td colspan="6" class="px-8 py-10 text-center text-slate-400 font-medium italic">
              Aucun produit trouvé
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modale Nouveau/Modifier Produit -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-[#1e293b] text-white">
          <h2 class="text-xl font-bold">{{ editingProduct ? 'Modifier le Produit' : 'Nouveau Produit' }}</h2>
          <button @click="showAddModal = false" class="p-2 hover:bg-slate-700 rounded-full text-slate-300">
            <X :size="20" />
          </button>
        </div>
        
        <form @submit.prevent="handleSubmitProduct" class="p-8 space-y-4">
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nom du produit</label>
            <input v-model="productForm.name" type="text" required placeholder="ex: Aliments Volaille" class="w-full border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-slate-50/50" />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Catégorie</label>
              <select v-model="productForm.category" required class="w-full border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none bg-slate-50/50 appearance-none font-medium">
                <option value="aliment">Aliment</option>
                <option value="medicament">Médicament</option>
                <option value="materiel">Matériel</option>
              </select>
            </div>
            <div v-if="productForm.category === 'aliment'">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Unité</label>
              <select v-model="productForm.unit" required class="w-full border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none bg-slate-50/50 appearance-none font-medium">
                <option value="t">t (tonne)</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="mg">mg</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{{ editingProduct ? 'Quantité Actuelle' : 'Quantité Initiale' }}</label>
              <input v-model="productForm.quantity" type="number" required min="0" placeholder="0" class="w-full border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-slate-50/50" />
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Seuil d'alerte</label>
              <input v-model="productForm.alertThreshold" type="number" required min="0" placeholder="10" class="w-full border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-slate-50/50" />
            </div>
          </div>

          <div class="pt-4 flex justify-end gap-4">
            <button type="button" @click="showAddModal = false" class="px-6 py-3 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors uppercase tracking-widest">Annuler</button>
            <button type="submit" :disabled="stockStore.loading" class="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-lg shadow-orange-500/20 transition-all">
              {{ stockStore.loading ? 'Traitement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modale de Mouvement de Stock -->
    <div v-if="showMovementModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center text-white" :class="movementType === 'add' ? 'bg-emerald-600' : 'bg-red-600'">
          <h2 class="text-xl font-bold">{{ movementType === 'add' ? 'Ajouter du Stock' : 'Retirer du Stock' }}</h2>
          <button @click="showMovementModal = false" class="p-2 hover:bg-black/10 rounded-full">
            <X :size="20" />
          </button>
        </div>
        
        <form @submit.prevent="handleMovement" class="p-8 space-y-4">
          <p class="text-slate-600 font-medium">Produit : <span class="font-bold text-slate-800">{{ selectedItem?.product.name }}</span></p>
          
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Quantité ({{ selectedItem?.product.category === 'aliment' ? selectedItem?.product.unit : 'unités' }})</label>
            <input v-model="movementForm.quantity" type="number" required min="1" class="w-full border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-slate-50/50" />
          </div>

          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Responsable</label>
            <input v-model="movementForm.responsible" type="text" required placeholder="Nom du responsable" class="w-full border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-slate-50/50" />
          </div>

          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Référence</label>
            <input v-model="movementForm.reference" type="text" placeholder="ex: Facture #123" class="w-full border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-slate-50/50" />
          </div>

          <div class="pt-4 flex justify-end gap-4">
            <button type="button" @click="showMovementModal = false" class="px-6 py-3 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors uppercase tracking-widest">Annuler</button>
            <button type="submit" :disabled="stockStore.loading" class="px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-lg transition-all text-white" :class="movementType === 'add' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'">
              Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modale de Confirmation de Suppression -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="p-8 text-center">
          <div class="w-16 h-16 mx-auto bg-rose-50 rounded-full flex items-center justify-center mb-4 border-4 border-rose-100">
            <AlertCircle :size="32" class="text-rose-500" />
          </div>
          <h2 class="text-xl font-bold text-slate-800">Confirmer la suppression</h2>
          <p class="text-slate-500 mt-2">Supprimer le produit <strong class="text-slate-700">{{ itemToDelete?.product.name }}</strong> ? Cette action supprimera également tous les stocks associés.</p>
        </div>
        
        <div class="px-8 py-6 bg-slate-50 flex justify-center gap-4">
          <button @click="showDeleteConfirm = false" class="px-6 py-3 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors uppercase tracking-widest">Annuler</button>
          <button @click="handleDelete" class="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-lg shadow-rose-500/20 transition-all">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStockStore } from '../stores/stockStore.js';
import { notify } from '../composables/useNotify.js';
import { Package, Search, Plus, X, AlertCircle, Filter, Pencil, Trash2 } from 'lucide-vue-next';

const stockStore = useStockStore();

// --- FILTRES ET RECHERCHE ---
const searchQuery = ref('');
const categoryFilter = ref('');
const statusFilter = ref('');

// --- ÉTATS MODALES ---
const showAddModal = ref(false);
const editingProduct = ref(null);
const productForm = ref({
  name: '',
  category: 'aliment',
  unit: 'kg',
  quantity: 0,
  alertThreshold: 0
});

const showMovementModal = ref(false);
const movementType = ref('add');
const selectedItem = ref(null);
const movementForm = ref({ quantity: 1, responsible: '', reference: '' });

const showDeleteConfirm = ref(false);
const itemToDelete = ref(null);

// --- CHARGEMENT ---
onMounted(async () => {
  await stockStore.fetchAllStocks();
});

// --- LOGIQUE DE FILTRAGE ---
const filteredStocks = computed(() => {
  return stockStore.stocks.filter(item => {
    const matchesSearch = item.product.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = !categoryFilter.value || item.product.category === categoryFilter.value;
    const isCrit = item.quantityAvailable <= item.product.alertThreshold;
    const matchesStatus = !statusFilter.value || (statusFilter.value === 'critique' ? isCrit : !isCrit);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
});

const isCritical = (item) => item.quantityAvailable <= item.product.alertThreshold;

// --- ACTIONS PRODUIT ---
const openAddProductModal = () => {
  editingProduct.value = null;
  productForm.value = { name: '', category: 'aliment', unit: 'kg', quantity: 0, alertThreshold: 0 };
  showAddModal.value = true;
};

const openEditProductModal = (item) => {
  editingProduct.value = item.product;
  productForm.value = { 
    name: item.product.name, 
    category: item.product.category, 
    unit: item.product.unit, 
    quantity: item.quantityAvailable,
    alertThreshold: item.product.alertThreshold 
  };
  showAddModal.value = true;
};

const handleSubmitProduct = async () => {
  try {
    if (editingProduct.value) {
      await stockStore.updateProduct(editingProduct.value._id, productForm.value);
      notify("Produit mis à jour");
    } else {
      await stockStore.addProduct(productForm.value);
      notify("Produit créé avec succès");
    }
    showAddModal.value = false;
  } catch (err) {
    notify(stockStore.error || "Une erreur est survenue");
  }
};

const confirmDelete = (item) => {
  itemToDelete.value = item;
  showDeleteConfirm.value = true;
};

const handleDelete = async () => {
  try {
    await stockStore.deleteProduct(itemToDelete.value.product._id);
    notify("Produit supprimé avec succès");
    showDeleteConfirm.value = false;
  } catch (err) {
    notify("Erreur lors de la suppression");
  }
};

// --- ACTIONS STOCK ---
const openMovementModal = (item, type) => {
  selectedItem.value = item;
  movementType.value = type;
  movementForm.value = { quantity: 1, responsible: '', reference: '' };
  showMovementModal.value = true;
};

const handleMovement = async () => {
  try {
    const { quantity, ...details } = movementForm.value;
    const productId = selectedItem.value.product._id;
    if (movementType.value === 'add') {
      await stockStore.recordEntry(productId, quantity, details);
      notify("Stock ajouté");
    } else {
      await stockStore.recordExit(productId, quantity, details);
      notify("Stock retiré");
    }
    showMovementModal.value = false;
  } catch (err) {
    notify(stockStore.error || "Erreur de mouvement");
  }
};
</script>

<style scoped>
.animate-in { animation: fadeIn 0.2s both, zoomIn 0.2s both; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes zoomIn { from { transform: scale(0.95); } to { transform: scale(1); } }
</style>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
// Import complet de Lucide pour éviter les erreurs "Component not found"
import { 
  Plus, Search, Pencil, Trash2, HandHelping, AlertCircle, 
  X, History, Package, AlertTriangle, TrendingUp 
} from "lucide-vue-next";

const API_URL = "http://localhost:7000/api";

// --- ÉTATS (REFS) ---
const foods = ref([]);
const movements = ref([]);
const showAddModal = ref(false);
const showDistributeModal = ref(false);
const showDeleteConfirm = ref(false);
const editingFood = ref(null);
const foodToDelete = ref(null);
const searchQuery = ref("");

// Formulaires
const initialFoodForm = { name: "", category: "Fourrage", price: 0, supplier: "", stock: 0, unit: "kg", minThreshold: 100 };
const foodForm = ref({ ...initialFoodForm });
const distributeForm = ref({ foodId: "", quantity: 0, batch: "" });

// --- LOGIQUE API ---
const fetchData = async () => {
  try {
    const [foodsRes, movesRes] = await Promise.all([
      axios.get(`${API_URL}/foods`),
      axios.get(`${API_URL}/movements`).catch(() => ({ data: [] }))
    ]);
    foods.value = foodsRes.data;
    movements.value = movesRes.data;
  } catch (err) {
    console.error("Erreur API:", err);
  }
};

onMounted(fetchData);

// --- ACTIONS ---
const openAddModal = (food = null) => {
  if (food) {
    editingFood.value = food;
    foodForm.value = { ...food }; 
  } else {
    editingFood.value = null;
    foodForm.value = { ...initialFoodForm };
  }
  showAddModal.value = true;
};

const saveFood = async () => {
  try {
    const payload = { ...foodForm.value };
    const id = payload._id;
    delete payload._id; 

    if (editingFood.value) {
      await axios.put(`${API_URL}/foods/${id}`, payload);
    } else {
      await axios.post(`${API_URL}/foods`, payload);
    }
    showAddModal.value = false;
    fetchData();
  } catch (err) {
    alert("Erreur enregistrement : " + (err.response?.data?.message || err.message));
  }
};

const handleDistribute = async () => {
  try {
    await axios.post(`${API_URL}/foods/distribute`, {
      foodId: distributeForm.value.foodId,
      quantity: distributeForm.value.quantity,
      target: distributeForm.value.batch
    });
    showDistributeModal.value = false;
    distributeForm.value = { foodId: "", quantity: 0, batch: "" };
    fetchData();
  } catch (err) {
    alert("Erreur distribution : " + (err.response?.data?.message || err.message));
  }
};

const confirmDelete = (food) => {
  foodToDelete.value = food;
  showDeleteConfirm.value = true;
};

const deleteFood = async () => {
  try {
    await axios.delete(`${API_URL}/foods/${foodToDelete.value._id}`);
    showDeleteConfirm.value = false;
    fetchData();
  } catch (err) {
    console.error(err);
  }
};

// --- CALCULS ---
const filteredFoods = computed(() => {
  return foods.value.filter(f => f.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

const totalStockValue = computed(() => {
  const val = foods.value.reduce((acc, f) => acc + (f.price * (f.stock / 1000)), 0);
  return new Intl.NumberFormat('fr-FR').format(val.toFixed(2));
});

const lowStockCount = computed(() => foods.value.filter(f => f.stock <= f.minThreshold).length);

const getCategoryClass = (cat) => {
  const map = { 
    'Fourrage': 'text-emerald-700 bg-emerald-50 border-emerald-100', 
    'Concentrés': 'text-blue-700 bg-blue-50 border-blue-100', 
    'Céréales': 'text-amber-700 bg-amber-50 border-amber-100' 
  };
  return map[cat] || 'text-slate-600 bg-slate-50 border-slate-100';
};
</script>

<template>
  <div class="p-6 md:p-10 bg-[#F8FAFC] min-h-screen font-sans">
    <div class="max-w-7xl mx-auto">
      
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight text-left">Alimentation & Stocks</h1>
          <p class="text-slate-500 mt-1 italic text-left">Flux en temps réel de votre exploitation</p>
        </div>
        <div class="flex gap-3 w-full md:w-auto">
          <button @click="showDistributeModal = true" class="flex-1 md:flex-none justify-center bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-slate-50 transition-all font-bold shadow-sm">
            <HandHelping :size="20" /> Distribuer
          </button>
          <button @click="openAddModal()" class="flex-1 md:flex-none justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all font-bold">
            <Plus :size="20" /> Nouveau
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-left">
        <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div class="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Package :size="28" /></div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Valeur Stock</p>
            <p class="text-2xl font-black text-slate-800">{{ totalStockValue }} €</p>
          </div>
        </div>
        <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div class="p-4 bg-rose-50 text-rose-600 rounded-2xl" :class="{'animate-bounce': lowStockCount > 0}"><AlertTriangle :size="28" /></div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Alertes Rupture</p>
            <p class="text-2xl font-black text-slate-800">{{ lowStockCount }} Aliments</p>
          </div>
        </div>
        <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div class="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp :size="28" /></div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Mouvements</p>
            <p class="text-2xl font-black text-slate-800">{{ movements.length }} Flux</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-12">
        <div class="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div class="relative w-full md:w-96 text-left">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" :size="18" />
            <input v-model="searchQuery" type="text" placeholder="Filtrer les aliments..." class="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 ring-blue-500/10 border-none transition-all" />
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50/50">
                <th class="px-8 py-5">Aliment</th>
                <th class="px-6 py-5">Catégorie</th>
                <th class="px-6 py-5 text-center">Stock</th>
                <th class="px-6 py-5 text-center">Statut</th>
                <th class="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 text-left">
              <tr v-for="food in filteredFoods" :key="food._id" class="group hover:bg-slate-50/50 transition-all">
                <td class="px-8 py-5 font-bold text-slate-800">
                  {{ food.name }} <br/><span class="text-[10px] text-slate-400 font-normal uppercase">{{ food.supplier }}</span>
                </td>
                <td class="px-6 py-5">
                  <span :class="['px-3 py-1 rounded-full text-[10px] font-black uppercase border', getCategoryClass(food.category)]">
                    {{ food.category }}
                  </span>
                </td>
                <td class="px-6 py-5 text-center font-black text-slate-700">
                  {{ food.stock }} <span class="text-[10px] text-slate-400 italic font-normal">{{ food.unit }}</span>
                </td>
                <td class="px-6 py-5 text-center">
                  <span v-if="food.stock <= food.minThreshold" class="bg-rose-50 text-rose-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase animate-pulse">Alerte</span>
                  <span v-else class="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Ok</span>
                </td>
                <td class="px-8 py-5 text-right flex justify-end gap-2">
                  <button @click="openAddModal(food)" class="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"><Pencil :size="16" /></button>
                  <button @click="confirmDelete(food)" class="p-2 hover:bg-rose-50 text-rose-600 rounded-lg"><Trash2 :size="16" /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="showDistributeModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
        <div class="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
          <h2 class="text-2xl font-black mb-6 text-left text-slate-900">Distribuer Ration</h2>
          <div class="space-y-4">
            <select v-model="distributeForm.foodId" class="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold appearance-none">
              <option value="" disabled>Sélectionner l'aliment</option>
              <option v-for="f in foods" :key="f._id" :value="f._id">{{ f.name }} (Dispo: {{ f.stock }})</option>
            </select>
            <input v-model="distributeForm.quantity" type="number" placeholder="Quantité" class="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
            <input v-model="distributeForm.batch" type="text" placeholder="Lot cible (ex: Bovins A)" class="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
            <div class="flex gap-3 pt-4">
              <button @click="showDistributeModal = false" class="flex-1 py-4 font-bold text-slate-400 uppercase text-xs">Annuler</button>
              <button @click="handleDistribute" class="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs">Confirmer</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
        <div class="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-black text-slate-900">{{ editingFood ? 'Modifier' : 'Nouveau' }}</h2>
            <button @click="showAddModal = false" class="text-slate-400"><X /></button>
          </div>
          <div class="space-y-4 text-left">
            <input v-model="foodForm.name" type="text" placeholder="Nom de l'aliment" class="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
            <div class="grid grid-cols-2 gap-4">
              <select v-model="foodForm.category" class="p-4 bg-slate-50 rounded-2xl outline-none font-bold">
                <option>Fourrage</option><option>Concentrés</option><option>Céréales</option>
              </select>
              <input v-model="foodForm.price" type="number" placeholder="Prix (€/T)" class="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
            </div>
            <input v-model="foodForm.supplier" type="text" placeholder="Fournisseur" class="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
            <div class="grid grid-cols-2 gap-4">
              <input v-model="foodForm.stock" type="number" placeholder="Stock initial" class="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
              <input v-model="foodForm.minThreshold" type="number" placeholder="Seuil alerte" class="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
            </div>
            <button @click="saveFood" class="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs mt-4">Enregistrer</button>
          </div>
        </div>
      </div>

      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
        <div class="bg-white rounded-[2rem] w-full max-w-sm p-8 text-center shadow-2xl">
          <div class="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle :size="32" />
          </div>
          <h2 class="text-xl font-black mb-2 text-slate-900">Supprimer ?</h2>
          <p class="text-slate-500 text-sm mb-6 italic">Cette action est irréversible.</p>
          <div class="flex flex-col gap-2">
            <button @click="deleteFood" class="w-full py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-xs">Supprimer</button>
            <button @click="showDeleteConfirm = false" class="w-full py-4 text-slate-400 font-bold uppercase text-xs">Annuler</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.animate-pulse {
  animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
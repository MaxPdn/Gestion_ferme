<script setup>
import { ref, computed } from "vue";
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  HandHelping,
  AlertCircle,
  X
} from "lucide-vue-next";

// États pour les modales
const showAddModal = ref(false);
const showDistributeModal = ref(false);
const showDeleteConfirm = ref(false);
const editingFood = ref(null);
const foodToDelete = ref(null);

// Formulaire pour l'ajout/édition
const foodForm = ref({
  name: "",
  category: "Fourrage",
  price: "",
  supplier: "",
  stock: "",
  unit: "kg"
});

// Formulaire pour la distribution
const distributeForm = ref({
  foodId: "",
  quantity: "",
  batch: ""
});

// Données fictives pour le frontend
const foods = ref([
  { id: 1, name: "Foin de prairie", category: "Fourrage", price: 125, supplier: "Ferme Martin", stock: 3200, unit: "kg", status: "En stock" },
  { id: 2, name: "Concentré protéiné", category: "Concentrés", price: 450, supplier: "AgriCoop", stock: 850, unit: "kg", status: "En stock" },
  { id: 3, name: "Maïs grain", category: "Céréales", price: 210, supplier: "Céréales du Sud", stock: 1200, unit: "kg", status: "En stock" },
  { id: 4, name: "Tourteau de soja", category: "Protéines", price: 380, supplier: "Import Agri", stock: 150, unit: "kg", status: "Stock faible" },
  { id: 5, name: "Minéraux complets", category: "Compléments", price: 520, supplier: "NutriVet", stock: 280, unit: "kg", status: "En stock" },
  { id: 6, name: "Orge fourragère", category: "Céréales", price: 195, supplier: "Céréales du Sud", stock: 680, unit: "kg", status: "En stock" },
]);

//variable de recherche
const searchQuery = ref(""); 

// Actions pour l'ajout/édition et la distribution
const openAddModal = (food = null) => {
  if (food) {
    editingFood.value = food;
    foodForm.value = { ...food };
  } else {
    editingFood.value = null;
    foodForm.value = { name: "", category: "Fourrage", price: "", supplier: "", stock: "", unit: "kg" };
  }
  showAddModal.value = true;
};

// Ouvrir la modale de distribution
const openDistributeModal = () => {
  distributeForm.value = { foodId: "", quantity: "", batch: "" };
  showDistributeModal.value = true;
};

const confirmDelete = (food) => {
  foodToDelete.value = food;
  showDeleteConfirm.value = true;
};

const deleteFood = () => {
  foods.value = foods.value.filter(f => f.id !== foodToDelete.value.id);
  showDeleteConfirm.value = false;
  foodToDelete.value = null;
};

// Recherche filtrée
const filteredFoods = computed(() => {
  return foods.value.filter(food => 
    food.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    food.category.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Styles pour les badges de catégorie
const getCategoryClass = (category) => {
  const classes = {
    'Fourrage': 'bg-blue-50 text-blue-500 border-blue-100',
    'Concentrés': 'bg-indigo-50 text-indigo-500 border-indigo-100',
    'Céréales': 'bg-sky-50 text-sky-500 border-sky-100',
    'Protéines': 'bg-blue-50 text-blue-600 border-blue-100',
    'Compléments': 'bg-blue-50 text-blue-500 border-blue-100'
  };
  return classes[category] || 'bg-gray-50 text-gray-500 border-gray-100';
};

// Styles pour le statut
const getStatusClass = (status) => {
  return status === 'En stock' 
    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
    : 'bg-rose-50 text-rose-500 border-rose-100';
};

</script>

<template>
  <div class="p-8 bg-slate-50 min-h-screen">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-800">Gestion des Aliments</h1>
      </div>
      
      <div class="flex items-center gap-3">
        <button 
          @click="openAddModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all font-semibold text-sm"
        >
          <Plus :size="18" />
          Nouvel Aliment
        </button>
        <button 
          @click="openDistributeModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all font-semibold text-sm"
        >
          <HandHelping :size="18" />
          Distribuer
        </button>
      </div>
    </div>

    <!-- Filtres et Actions -->
    <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6">
      <div class="flex flex-col md:flex-row justify-between gap-4">
        <div class="relative flex-1 max-w-md group">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Rechercher un aliment..." 
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all"
          />
        </div>
        
        <button 
          @click="openAddModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all font-bold"
        >
          <Plus :size="20" />
          Ajouter un aliment
        </button>
      </div>

      <!-- Table -->
      <div class="mt-8 overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-slate-500 border-b border-slate-100">
              <th class="px-6 py-4 font-semibold text-sm">Nom aliment</th>
              <th class="px-6 py-4 font-semibold text-sm">Catégorie</th>
              <th class="px-6 py-4 font-semibold text-sm text-center">Prix unitaire</th>
              <th class="px-6 py-4 font-semibold text-sm">Fournisseur</th>
              <th class="px-6 py-4 font-semibold text-sm">Stock actuel</th>
              <th class="px-6 py-4 font-semibold text-sm text-center">Statut</th>
              <th class="px-6 py-4 font-semibold text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="food in filteredFoods" :key="food.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-5">
                <span class="font-bold text-slate-700">{{ food.name }}</span>
              </td>
              <td class="px-6 py-5">
                <span :class="['px-4 py-1.5 rounded-full text-xs font-semibold border', getCategoryClass(food.category)]">
                  {{ food.category }}
                </span>
              </td>
              <td class="px-6 py-5 text-center">
                <div class="flex flex-col items-center">
                  <span class="text-slate-700 font-medium">{{ food.price }}</span>
                  <span class="text-[10px] text-slate-400 uppercase tracking-wider font-bold">€/tonne</span>
                </div>
              </td>
              <td class="px-6 py-5">
                <span class="text-slate-500 font-medium">{{ food.supplier }}</span>
              </td>
              <td class="px-6 py-5">
                <span class="text-slate-600 font-semibold">{{ food.stock }} {{ food.unit }}</span>
              </td>
              <td class="px-6 py-5 text-center">
                <span :class="['px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border inline-block min-w-[80px]', getStatusClass(food.status)]">
                  {{ food.status }}
                </span>
              </td>
              <td class="px-6 py-5 text-right">
                <div class="flex justify-end gap-2">
                  <button 
                    @click="openAddModal(food)"
                    class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil :size="18" />
                  </button>
                  <button 
                    @click="confirmDelete(food)"
                    class="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 :size="18" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modale Ajout/Édition -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 class="text-xl font-bold text-slate-800">{{ editingFood ? 'Modifier l\'aliment' : 'Nouvel aliment' }}</h2>
          <button @click="showAddModal = false" class="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <X :size="20" />
          </button>
        </div>
        
        <div class="p-8 space-y-4">
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nom de l'aliment</label>
            <input v-model="foodForm.name" type="text" placeholder="ex: Foin de prairie" class="w-full border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all bg-slate-50/50" />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Catégorie</label>
              <select v-model="foodForm.category" class="w-full border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none bg-slate-50/50 appearance-none font-medium">
                <option>Fourrage</option>
                <option>Concentrés</option>
                <option>Céréales</option>
                <option>Protéines</option>
                <option>Compléments</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Prix (€/tonne)</label>
              <input v-model="foodForm.price" type="number" placeholder="125" class="w-full border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all bg-slate-50/50" />
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Fournisseur</label>
            <input v-model="foodForm.supplier" type="text" placeholder="ex: AgriCoop" class="w-full border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all bg-slate-50/50" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Stock initial</label>
              <input v-model="foodForm.stock" type="number" placeholder="3200" class="w-full border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all bg-slate-50/50" />
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Unité</label>
              <select v-model="foodForm.unit" class="w-full border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none bg-slate-50/50 appearance-none font-medium">
                <option>kg</option>
                <option>tonnes</option>
                <option>sacs</option>
              </select>
            </div>
          </div>
        </div>

        <div class="px-8 py-6 bg-slate-50 flex justify-end gap-4">
          <button @click="showAddModal = false" class="px-6 py-3 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors uppercase tracking-widest">Annuler</button>
          <button @click="showAddModal = false" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-lg shadow-blue-600/20 transition-all">
            {{ editingFood ? 'Enregistrer' : 'Créer' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modale Distribution -->
    <div v-if="showDistributeModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 class="text-xl font-bold text-slate-800">Distribuer des aliments</h2>
          <button @click="showDistributeModal = false" class="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <X :size="20" />
          </button>
        </div>
        
        <div class="p-8 space-y-4">
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Choisir l'aliment</label>
            <select v-model="distributeForm.foodId" class="w-full border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none bg-slate-50/50 appearance-none font-medium">
              <option value="" disabled>Sélectionner un aliment...</option>
              <option v-for="food in foods" :key="food.id" :value="food.id">{{ food.name }} (Stock: {{ food.stock }} {{ food.unit }})</option>
            </select>
          </div>
          
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Quantité à distribuer</label>
            <input v-model="distributeForm.quantity" type="number" placeholder="0" class="w-full border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all bg-slate-50/50" />
          </div>

          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Lot d'animaux / Parcelle</label>
            <input v-model="distributeForm.batch" type="text" placeholder="ex: Lot A - Bovins" class="w-full border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all bg-slate-50/50" />
          </div>
        </div>

        <div class="px-8 py-6 bg-slate-50 flex justify-end gap-4">
          <button @click="showDistributeModal = false" class="px-6 py-3 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors uppercase tracking-widest">Annuler</button>
          <button @click="showDistributeModal = false" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-lg shadow-blue-600/20 transition-all">
            Confirmer la distribution
          </button>
        </div>
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
          <p class="text-slate-500 mt-2">Voulez-vous vraiment supprimer l'aliment <strong class="text-slate-700">{{ foodToDelete?.name }}</strong> ? Cette action est irréversible.</p>
        </div>
        
        <div class="px-8 py-6 bg-slate-50 flex justify-center gap-4">
          <button @click="showDeleteConfirm = false" class="px-6 py-3 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors uppercase tracking-widest">Annuler</button>
          <button @click="deleteFood" class="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-lg shadow-rose-500/20 transition-all">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles personnalisés si nécessaire */
</style>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { notify } from "../composables/useNotify";
import { Plus, Pencil, Trash2, X, AlertTriangle, Search, Filter } from "lucide-vue-next";

const users = ref([]);
const loading = ref(true);
const showModal = ref(false);
const showDeleteConfirm = ref(false);
const editingUser = ref(null);
const userToDelete = ref(null);

// Filtres
const searchQuery = ref("");
const roleFilter = ref("");

const form = ref({
  username: "",
  email: "",
  password: "",
  role: "Agent terrain"
});

// Calcul de la liste filtrée
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesName = user.username.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesRole = roleFilter.value === "" || user.role === roleFilter.value;
    return matchesName && matchesRole;
  });
});

const fetchUsers = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:7000/api/users", {
      headers: { Authorization: `Bearer ${token}` }
    });
    users.value = res.data;
  } catch (err) {
    notify(err.response?.data?.message || "Erreur lors du chargement des utilisateurs");
  } finally {
    loading.value = false;
  }
};

const openModal = (user = null) => {
  if (user) {
    editingUser.value = user;
    form.value = {
      username: user.username,
      email: user.email,
      password: "",
      role: user.role
    };
  } else {
    editingUser.value = null;
    form.value = {
      username: "",
      email: "",
      password: "",
      role: "Agent terrain"
    };
  }
  showModal.value = true;
};

const saveUser = async () => {
  try {
    const token = localStorage.getItem("token");
    if (editingUser.value) {
      await axios.put(`http://localhost:7000/api/users/${editingUser.value._id}`, form.value, {
        headers: { Authorization: `Bearer ${token}` }
      });
      notify("Utilisateur mis à jour avec succès");
    } else {
      await axios.post("http://localhost:7000/api/users", form.value, {
        headers: { Authorization: `Bearer ${token}` }
      });
      notify("Utilisateur créé avec succès");
    }
    showModal.value = false;
    fetchUsers();
  } catch (err) {
    notify(err.response?.data?.message || "Erreur lors de l'enregistrement");
  }
};

const confirmDelete = (user) => {
  userToDelete.value = user;
  showDeleteConfirm.value = true;
};

const deleteUser = async () => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:7000/api/users/${userToDelete.value._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    notify("Utilisateur supprimé avec succès");
    showDeleteConfirm.value = false;
    fetchUsers();
  } catch (err) {
    notify(err.response?.data?.message || "Erreur lors de la suppression");
  }
};

onMounted(fetchUsers);
</script>

<template>
  <div class="p-8 bg-slate-50 min-h-screen">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-slate-800">Gestion des Utilisateurs</h1>
        <p class="text-slate-500 mt-1 font-medium">Administration des accès de la plateforme TerraCore</p>
      </div>
      <button 
        @click="openModal()"
        class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95 font-bold uppercase tracking-wide text-sm"
      >
        <Plus :size="20" />
        Ajouter un utilisateur
      </button>
    </div>

    <!-- Barre de recherche et filtres -->
    <div class="flex flex-col md:flex-row gap-4 mb-8">
      <div class="relative flex-1 group">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" :size="20" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Rechercher par nom..." 
          class="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm"
        />
      </div>
      
      <div class="relative w-full md:w-64 group">
        <Filter class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" :size="18" />
        <select 
          v-model="roleFilter"
          class="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none appearance-none cursor-pointer shadow-sm font-medium text-slate-700"
        >
          <option value="">Tous les rôles</option>
          <option value="Admin">Administrateurs</option>
          <option value="Gestionnaire">Gestionnaires</option>
          <option value="Agent terrain">Agents terrain</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-slate-50/80 border-b border-slate-200">
          <tr>
            <th class="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Nom</th>
            <th class="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Email</th>
            <th class="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Rôle</th>
            <th class="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="user in filteredUsers" :key="user._id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-8 py-5">
              <span class="font-bold text-slate-700">{{ user.username }}</span>
            </td>
            <td class="px-8 py-5 text-slate-500 font-medium">{{ user.email }}</td>
            <td class="px-8 py-5">
              <span 
                :class="[
                  'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border',
                  user.role === 'Admin' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : 
                  user.role === 'Gestionnaire' ? 'bg-slate-800/10 text-slate-800 border-slate-800/20' : 'bg-slate-100 text-slate-500 border-slate-200'
                ]"
              >
                {{ user.role }}
              </span>
            </td>
            <td class="px-8 py-5 text-right">
              <div class="flex justify-end gap-3">
                <button 
                  @click="openModal(user)"
                  class="p-2.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
                >
                  <Pencil :size="18" />
                </button>
                <button 
                  @click="confirmDelete(user)"
                  class="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 :size="18" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="loading" class="p-16 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500/20 border-t-orange-500 mb-4"></div>
        <p class="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Chargement des données...</p>
      </div>
      <div v-if="!loading && filteredUsers.length === 0" class="p-16 text-center">
        <div class="bg-slate-50 inline-block p-6 rounded-full mb-4">
            <Search :size="32" class="text-slate-300" />
        </div>
        <p class="text-slate-500 font-bold">Aucun utilisateur trouvé</p>
        <p class="text-slate-400 text-sm">Essayez d'ajuster vos filtres de recherche</p>
      </div>
    </div>

    <!-- Modal Create/Edit -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
        <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 class="text-xl font-bold text-slate-800">
            {{ editingUser ? 'Modifier' : 'Créer' }} un compte
          </h3>
          <button @click="showModal = false" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all">
            <X :size="20" />
          </button>
        </div>
        
        <div class="p-8 space-y-5">
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Nom d'utilisateur</label>
            <input v-model="form.username" type="text" placeholder="Ex: Jean Dupont" class="w-full border border-slate-200 p-3.5 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-slate-50/50" />
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Adresse Email</label>
            <input v-model="form.email" type="email" placeholder="email@exemple.com" class="w-full border border-slate-200 p-3.5 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-slate-50/50" />
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Mot de passe {{ editingUser ? '(Optionnel)' : '' }}</label>
            <input v-model="form.password" type="password" placeholder="••••••••" class="w-full border border-slate-200 p-3.5 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-slate-50/50" />
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Rôle utilisateur</label>
            <div class="relative">
                <select v-model="form.role" class="w-full border border-slate-200 p-3.5 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none bg-slate-50/50 appearance-none font-medium text-slate-700">
                <option value="Admin">Administrateur</option>
                <option value="Gestionnaire">Gestionnaire</option>
                <option value="Agent terrain">Agent terrain</option>
                </select>
                <Filter class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" :size="16" />
            </div>
          </div>
        </div>

        <div class="px-8 py-6 bg-slate-50 flex justify-end gap-4">
          <button @click="showModal = false" class="px-5 py-2.5 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors uppercase tracking-widest">Annuler</button>
          <button @click="saveUser" class="bg-[#1e293b] hover:bg-slate-800 text-white px-8 py-3 rounded-2xl font-black text-xs shadow-xl shadow-slate-900/20 transition-all active:scale-95 uppercase tracking-[0.1em]">
            {{ editingUser ? 'Mettre à jour' : 'Confirmer la création' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Delete Confirmation -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden">
        <div class="p-10 text-center">
          <div class="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <AlertTriangle :size="40" />
          </div>
          <h3 class="text-2xl font-black text-slate-800 mb-3 uppercase tracking-tighter">Avertissement</h3>
          <p class="text-slate-500 leading-relaxed">Voulez-vous vraiment supprimer le compte de <span class="font-bold text-slate-800">{{ userToDelete?.username }}</span> ?</p>
        </div>
        
        <div class="px-8 py-6 bg-slate-50 flex gap-4">
          <button @click="showDeleteConfirm = false" class="flex-1 px-4 py-4 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 rounded-2xl transition-all">Retour</button>
          <button @click="deleteUser" class="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-500/30 transition-all active:scale-95">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

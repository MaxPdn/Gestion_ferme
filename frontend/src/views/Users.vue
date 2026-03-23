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
  <div class="p-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-slate-800">Gestion des Utilisateurs</h1>
        <p class="text-slate-500 mt-1">Gérez les accès et les rôles de votre équipe</p>
      </div>
      <button 
        @click="openModal()"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
      >
        <Plus :size="20" />
        Ajouter un utilisateur
      </button>
    </div>

    <!-- Barre de recherche et filtres -->
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="20" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Rechercher par nom..." 
          class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
        />
      </div>
      
      <div class="relative w-full md:w-64">
        <Filter class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="18" />
        <select 
          v-model="roleFilter"
          class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer shadow-sm"
        >
          <option value="">Tous les rôles</option>
          <option value="Admin">Admin</option>
          <option value="Gestionnaire">Gestionnaire</option>
          <option value="Agent terrain">Agent terrain</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-6 py-4 text-sm font-semibold text-slate-600">Nom</th>
            <th class="px-6 py-4 text-sm font-semibold text-slate-600">Email</th>
            <th class="px-6 py-4 text-sm font-semibold text-slate-600">Rôle</th>
            <th class="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="user in filteredUsers" :key="user._id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-6 py-4">
              <span class="font-medium text-slate-700">{{ user.username }}</span>
            </td>
            <td class="px-6 py-4 text-slate-600">{{ user.email }}</td>
            <td class="px-6 py-4">
              <span 
                :class="[
                  'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                  user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 
                  user.role === 'Gestionnaire' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                ]"
              >
                {{ user.role }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex justify-end gap-2">
                <button 
                  @click="openModal(user)"
                  class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Pencil :size="18" />
                </button>
                <button 
                  @click="confirmDelete(user)"
                  class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 :size="18" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="loading" class="p-12 text-center text-slate-400">
        Chargement...
      </div>
      <div v-if="!loading && filteredUsers.length === 0" class="p-12 text-center text-slate-400">
        Aucun utilisateur ne correspond à votre recherche.
      </div>
    </div>

    <!-- Modal Create/Edit -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 class="text-xl font-bold text-slate-800">
            {{ editingUser ? 'Modifier' : 'Ajouter' }} un utilisateur
          </h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600">
            <X :size="24" />
          </button>
        </div>
        
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Nom d'utilisateur</label>
            <input v-model="form.username" type="text" class="w-full border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input v-model="form.email" type="email" class="w-full border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Mot de passe {{ editingUser ? '(laisser vide pour ne pas changer)' : '' }}</label>
            <input v-model="form.password" type="password" class="w-full border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Rôle</label>
            <select v-model="form.role" class="w-full border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="Admin">Admin</option>
              <option value="Gestionnaire">Gestionnaire</option>
              <option value="Agent terrain">Agent terrain</option>
            </select>
          </div>
        </div>

        <div class="px-6 py-4 bg-slate-50 flex justify-end gap-3">
          <button @click="showModal = false" class="px-4 py-2 text-slate-600 font-medium hover:text-slate-800">Annuler</button>
          <button @click="saveUser" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95">
            Enregistrer
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Delete Confirmation -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div class="p-6 text-center">
          <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle :size="32" />
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">Confirmer la suppression</h3>
          <p class="text-slate-500">Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{{ userToDelete?.username }}</strong> ? Cette action est irréversible.</p>
        </div>
        
        <div class="px-6 py-4 bg-slate-50 flex justify-center gap-3">
          <button @click="showDeleteConfirm = false" class="flex-1 px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-all">Annuler</button>
          <button @click="deleteUser" class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

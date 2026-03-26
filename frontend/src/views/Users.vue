<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { notify } from "../composables/useNotify";
import { useAutoRefresh } from "../composables/useAutoRefresh";

const { triggerRefresh, onRefresh } = useAutoRefresh();

import { Plus, Pencil, Trash2, X, AlertTriangle, Search } from "lucide-vue-next"; 


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
// Fonction pour enregistrer un utilisateur
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
    await fetchUsers();
    triggerRefresh();
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
    await fetchUsers();
    triggerRefresh();
  } catch (err) {
    notify(err.response?.data?.message || "Erreur lors de la suppression");
  }
};

onMounted(fetchUsers);
onRefresh(fetchUsers);
</script>

<template>
  <div class="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
    <!-- Header -->
    <div class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="heading-1 text-slate-800">Gestion Utilisateurs</h1>
            <p class="text-small text-slate-500 mt-2">Administrez les accès de la plateforme</p>
          </div>
          <button @click="openModal()"
            class="btn bg-orange-500 hover:bg-orange-600 text-white font-semibold self-start">
            <Plus :size="18" />
            Ajouter
          </button>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <main class="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <!-- Filtres -->
      <div class="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6">
        <div class="relative flex-1">
          <input v-model="searchQuery" type="text" placeholder="Rechercher..."
            class="w-full px-4 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none transition-all text-sm" />
        </div>

        <div class="relative w-full sm:w-48">
          <select v-model="roleFilter"
            class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none appearance-none cursor-pointer text-sm font-medium text-slate-700">
            <option value="">Tous les rôles</option>
            <option value="Admin">Administrateurs</option>
            <option value="Gestionnaire">Gestionnaires</option>
            <option value="Agent terrain">Agents terrain</option>
          </select>
        </div>
      </div>

      <!-- État de chargement -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-b-orange-500"></div>
      </div>

      <!-- Tableau Desktop -->
      <div v-else-if="!loading" class="hidden md:block card overflow-hidden">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Utilisateur</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rôle</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="user in filteredUsers" :key="user._id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4">
                <span class="font-bold text-slate-800">{{ user.username }}</span>
              </td>
              <td class="px-6 py-4 text-slate-500 font-medium text-sm">{{ user.email }}</td>
              <td class="px-6 py-4">
                <span :class="[
                  'px-3 py-1 rounded-lg text-xs font-bold',
                  user.role === 'Admin' ? 'bg-orange-100 text-orange-700' :
                    user.role === 'Gestionnaire' ? 'bg-slate-200 text-slate-700' :
                      'bg-slate-100 text-slate-600'
                ]">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <button @click="openModal(user)"
                    class="p-2 hover:bg-orange-100 text-orange-600 rounded-lg transition-colors" title="Éditer">
                    <Pencil :size="18" />
                  </button>
                  <button @click="confirmDelete(user)"
                    class="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors" title="Supprimer">
                    <Trash2 :size="18" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Cartes Mobile -->
      <div v-else class="md:hidden space-y-3">
        <div v-for="user in filteredUsers" :key="user._id" class="card">
          <div class="flex items-start justify-between mb-3">
            <div class="min-w-0 flex-1">
              <h3 class="font-bold text-slate-800 truncate">{{ user.username }}</h3>
              <p class="text-small text-slate-500 truncate">{{ user.email }}</p>
            </div>
            <span :class="[
              'px-2 py-1 rounded text-xs font-bold flex-shrink-0',
              user.role === 'Admin' ? 'bg-orange-100 text-orange-700' :
                user.role === 'Gestionnaire' ? 'bg-slate-200 text-slate-700' :
                  'bg-slate-100 text-slate-600'
            ]">
              {{ user.role }}
            </span>
          </div>
          <div class="flex gap-2 pt-3 border-t border-slate-100">
            <button @click="openModal(user)"
              class="flex-1 py-2 px-3 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium text-sm transition-colors flex items-center justify-center gap-2">
              <Pencil :size="16" />
              Éditer
            </button>
            <button @click="confirmDelete(user)"
              class="flex-1 py-2 px-3 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-medium text-sm transition-colors flex items-center justify-center gap-2">
              <Trash2 :size="16" />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div v-if="!loading && filteredUsers.length === 0" class="card text-center py-12">
        <Search :size="48" class="mx-auto text-slate-300 mb-4" />
        <p class="text-slate-500 mb-2">Aucun utilisateur trouvé</p>
        <p class="text-small text-slate-400">Ajustez vos filtres ou créez un nouvel utilisateur</p>
      </div>
    </main>

    <!-- Modal Create/Edit -->
    <div v-if="showModal"
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto">
        <div class="sticky top-0 p-4 md:p-6 border-b border-slate-200 bg-white flex items-center justify-between">
          <h2 class="heading-2 text-slate-800">
            {{ editingUser ? 'Modifier' : 'Créer' }} un compte
          </h2>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <X :size="24" />
          </button>
        </div>

        <form @submit.prevent="saveUser" class="p-4 md:p-6 space-y-4">
          <div>
            <label class="text-small text-slate-600 font-semibold block mb-2">Nom d'utilisateur</label>
            <input v-model="form.username" type="text" placeholder="Jean Dupont" required
              class="w-full border border-slate-200 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none transition-all text-sm" />
          </div>

          <div>
            <label class="text-small text-slate-600 font-semibold block mb-2">Email</label>
            <input v-model="form.email" type="email" placeholder="email@exemple.com" required
              class="w-full border border-slate-200 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none transition-all text-sm" />
          </div>

          <div>
            <label class="text-small text-slate-600 font-semibold block mb-2">
              Mot de passe {{ editingUser ? '(Optionnel)' : '' }}
            </label>
            <input v-model="form.password" type="password" placeholder="••••••••" :required="!editingUser"
              class="w-full border border-slate-200 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none transition-all text-sm" />
          </div>

          <div>
            <label class="text-small text-slate-600 font-semibold block mb-2">Rôle</label>
            <select v-model="form.role" required
              class="w-full border border-slate-200 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none text-sm font-medium text-slate-700">
              <option value="Admin">Administrateur</option>
              <option value="Gestionnaire">Gestionnaire</option>
              <option value="Agent terrain">Agent terrain</option>
            </select>
          </div>

          <div class="flex gap-2 pt-4 border-t border-slate-100">
            <button type="submit" class="flex-1 btn bg-orange-500 hover:bg-orange-600 text-white font-semibold">
              {{ editingUser ? 'Modifier' : 'Créer' }}
            </button>
            <button type="button" @click="showModal = false"
              class="flex-1 btn bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Confirmation Suppression -->
    <div v-if="showDeleteConfirm"
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div class="p-6 border-b border-slate-200">
          <h2 class="heading-2 text-slate-800">Confirmer la suppression</h2>
          <p class="text-small text-slate-500 mt-2">
            Êtes-vous certain de vouloir supprimer l'utilisateur
            <span class="font-bold">{{ userToDelete?.username }}</span> ?
          </p>
        </div>

        <div class="p-6 flex gap-3">
          <button @click="deleteUser" class="flex-1 btn bg-red-600 hover:bg-red-700 text-white font-semibold">
            Supprimer
          </button>
          <button @click="showDeleteConfirm = false"
            class="flex-1 btn bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold">
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

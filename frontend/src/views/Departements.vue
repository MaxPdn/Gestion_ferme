<script setup>
import { ref, onMounted, computed } from "vue";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../services/departmentService.js";
import { getCampaigns } from "../services/campaignService.js";
import Swal from 'sweetalert2'; // Importation de SweetAlert2

const departments = ref([]);
const allCampaigns = ref([]);
const loading = ref(false);
const error = ref("");
const selectedDeptId = ref(null);

const fetchData = async () => {
  loading.value = true;
  try {
    const [deptRes, campRes] = await Promise.all([
      getDepartments(),
      getCampaigns(),
    ]);
    departments.value = deptRes.data;
    allCampaigns.value = campRes.data;

    if (departments.value.length > 0 && !selectedDeptId.value) {
      selectedDeptId.value = departments.value[0]._id;
    }
  } catch (err) {
    error.value = "Erreur lors du chargement des données";
  } finally {
    loading.value = false;
  }
};

const filteredCampaigns = computed(() => {
  return allCampaigns.value.filter(
    (c) => c.department?._id === selectedDeptId.value,
  );
});

const newDeptName = ref("");
const creating = ref(false);

const handleCreate = async () => {
  if (!newDeptName.value.trim()) return;
  creating.value = true;
  try {
    await createDepartment({ name: newDeptName.value.trim() });
    newDeptName.value = "";
    await fetchData();
  } catch (err) {
    alert(err.response?.data?.message || "Erreur création");
  } finally {
    creating.value = false;
  }
};

const editingId = ref(null);
const editedName = ref("");

const startEdit = (dept) => {
  editingId.value = dept._id;
  editedName.value = dept.name;
};

const cancelEdit = () => {
  editingId.value = null;
  editedName.value = "";
};

const saveEdit = async (id) => {
  if (!editedName.value.trim()) return;
  try {
    await updateDepartment(id, { name: editedName.value.trim() });
    cancelEdit();
    await fetchData();
  } catch (err) {
    alert(err.response?.data?.message || "Erreur mise à jour");
  }
};

// const handleDelete = async (id) => {
//   if (!confirm("Supprimer ce département ?")) return;
//   try {
//     await deleteDepartment(id);
//     if (selectedDeptId.value === id) selectedDeptId.value = null;
//     await fetchData();
//   } catch (err) {
//     alert(err.response?.data?.message || "Erreur suppression");
//   }
// };

const handleDelete = async (id, name) => {
  // Configuration du modal de confirmation
  const result = await Swal.fire({
    title: 'Êtes-vous sûr ?',
    text: `Le département "${name}" sera définitivement supprimée.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#2563eb', // Le bleu-600 de ton bouton "Nouvelle campagne"
    cancelButtonColor: '#94a3b8', // Un gris ardoise discret
    confirmButtonText: 'Oui, supprimer',
    cancelButtonText: 'Annuler',
    reverseButtons: true, // Met "Annuler" à gauche
    customClass: {
      popup: 'rounded-3xl', // Pour matcher tes arrondis "rounded-3xl"
      confirmButton: 'rounded-xl px-6 py-3 font-semibold',
      cancelButton: 'rounded-xl px-6 py-3 font-semibold'
    }
  });

  // Si l'utilisateur a cliqué sur "Oui"
  if (result.isConfirmed) {
    try {
      await deleteDepartment(id);
      
      // Mise à jour de l'état local
      departments.value = departments.value.filter(c => c._id !== id);

      // Notification de succès
      Swal.fire({
        title: 'Supprimé !',
        text: 'Le département a été retirée avec succès.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: 'rounded-3xl' }
      });
      
    } catch (err) {
      console.error("Erreur suppression", err);
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de supprimer le département.',
        icon: 'error',
        customClass: { popup: 'rounded-3xl' }
      });
    }
  }
};

onMounted(fetchData);

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(amount);
};
</script>

<template>
  <div class="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
    <!-- Header -->
    <div class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div class="flex flex-col gap-4">
          <div>
            <h1 class="heading-1 text-slate-800">Gestion des Départements</h1>
            <p class="text-small text-slate-500 mt-2">Gérez vos zones de production et leurs campagnes</p>
          </div>
          <div class="flex flex-col sm:flex-row gap-2 w-full">
            <input
              v-model="newDeptName"
              type="text"
              placeholder="Nouveau département..."
              class="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none transition-all text-sm font-semibold"
              @keyup.enter="handleCreate"
            />
            <button
              @click="handleCreate"
              :disabled="creating || !newDeptName"
              class="btn bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-semibold self-start sm:self-auto"
            >
              {{ creating ? "..." : "Ajouter" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <main class="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <!-- État de chargement -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-b-orange-500"></div>
      </div>

      <!-- Grille responsive -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Sidebar Départements -->
        <aside class="lg:col-span-1 order-1 lg:order-none">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
            <h2 class="heading-3 text-slate-800 mb-4">Départements</h2>
            
            <div v-if="departments.length === 0" class="text-center py-8">
              <p class="text-small text-slate-500">Aucun département</p>
            </div>

            <div v-else class="space-y-2 max-h-96 overflow-y-auto">
              <button
                v-for="dept in departments"
                :key="dept._id"
                @click="selectedDeptId = dept._id"
                :class="[
                  'w-full text-left p-3 rounded-lg border-2 transition-all flex items-center justify-between gap-2',
                  selectedDeptId === dept._id
                    ? 'bg-orange-50 border-orange-500 shadow-sm'
                    : 'bg-slate-50 border-transparent hover:border-slate-200'
                ]"
              >
                <div class="min-w-0 flex-1">
                  <input
                    v-if="editingId === dept._id"
                    v-model="editedName"
                    @click.stop
                    type="text"
                    class="w-full bg-white border border-slate-200 px-2 py-1 rounded text-sm font-bold focus:outline-none focus:border-orange-500"
                  />
                  <span
                    v-else
                    :class="['text-sm font-bold truncate block', selectedDeptId === dept._id ? 'text-orange-700' : 'text-slate-700']"
                  >
                    {{ dept.name }}
                  </span>
                </div>

                <div class="flex gap-1 flex-shrink-0" @click.stop>
                  <template v-if="editingId === dept._id">
                    <button
                      @click="saveEdit(dept._id)"
                      class="p-1 hover:bg-green-100 text-green-600 rounded transition-colors"
                      title="Valider"
                    >
                      ✓
                    </button>
                    <button
                      @click="cancelEdit"
                      class="p-1 hover:bg-slate-100 text-slate-400 rounded transition-colors"
                      title="Annuler"
                    >
                      ✕
                    </button>
                  </template>
                  <template v-else>
                    <button
                      @click="startEdit(dept)"
                      class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-100 text-slate-600 transition-all"
                      title="Éditer"
                    >
                      ✏️
                    </button>
                    <button
                      @click="handleDelete(dept._id, dept.name)"
                      class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-600 transition-all"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </template>
                </div>
              </button>
            </div>
          </div>
        </aside>

        <!-- Contenu Principal Campagnes -->
        <main v-if="selectedDeptId" class="lg:col-span-3 order-2 lg:order-none">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <!-- Header du département -->
            <div class="p-4 md:p-6 border-b border-slate-200 bg-gradient-to-r from-orange-50 to-white">
              <h2 class="heading-2 text-slate-800">
                Campagnes - 
                <span class="text-orange-600">
                  {{ departments.find((d) => d._id === selectedDeptId)?.name }}
                </span>
              </h2>
              <p class="text-small text-slate-500 mt-2">
                {{ filteredCampaigns.length }} campagne(s)
              </p>
            </div>

            <!-- Contenu Campagnes -->
            <div>
              <div v-if="filteredCampaigns.length === 0" class="p-8 text-center">
                <p class="text-slate-500 mb-4">Aucune campagne pour ce département</p>
              </div>

              <template v-else>
                <!-- Desktop: Table -->
                <div class="hidden md:block overflow-x-auto">
                  <table class="w-full">
                    <thead>
                      <tr class="bg-slate-50 border-b border-slate-200">
                        <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nom</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Sujets</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Budget</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      <tr v-for="campaign in filteredCampaigns" :key="campaign._id" class="hover:bg-slate-50 transition-colors">
                        <td class="px-6 py-4">
                          <p class="font-semibold text-slate-800">{{ campaign.name }}</p>
                        </td>
                        <td class="px-6 py-4">
                          <span 
                            :class="[
                              'px-3 py-1 rounded-lg text-xs font-bold',
                              campaign.status === 'En cours' ? 'bg-green-100 text-green-700' :
                              campaign.status === 'En préparation' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-slate-100 text-slate-600'
                            ]"
                          >
                            {{ campaign.status }}
                          </span>
                        </td>
                        <td class="px-6 py-4">
                          <p class="text-slate-700 font-medium">{{ campaign.objective || 0 }}</p>
                        </td>
                        <td class="px-6 py-4">
                          <p class="text-slate-700 font-medium">{{ formatCurrency(campaign.budget || 0) }}</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Mobile: Cards -->
                <div class="md:hidden p-4 space-y-3">
                  <div 
                    v-for="campaign in filteredCampaigns" 
                    :key="campaign._id" 
                    class="card"
                  >
                  <div class="flex items-start justify-between mb-3">
                    <h3 class="heading-3 text-slate-800">{{ campaign.name }}</h3>
                    <span 
                      :class="[
                        'px-2 py-1 rounded text-xs font-bold flex-shrink-0',
                        campaign.status === 'En cours' ? 'bg-green-100 text-green-700' :
                        campaign.status === 'En préparation' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-600'
                      ]"
                    >
                      {{ campaign.status }}
                    </span>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="bg-slate-50 p-3 rounded-lg">
                      <p class="text-xs text-slate-500 font-semibold mb-1">Objectif</p>
                      <p class="text-lg font-bold text-slate-800">{{ campaign.objective || 0 }}</p>
                    </div>
                    <div class="bg-slate-50 p-3 rounded-lg">
                      <p class="text-xs text-slate-500 font-semibold mb-1">Budget</p>
                      <p class="text-sm font-bold text-orange-600">{{ formatCurrency(campaign.budget || 0) }}</p>
                    </div>
                  </div>
                </div>
              </div>
              </template>
            </div>
          </div>
        </main>

        <!-- Message aucune sélection -->
        <div v-else class="lg:col-span-3 order-2 lg:order-none card text-center py-12">
          <p class="text-slate-500 mb-4">Sélectionnez un département pour voir les campagnes</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Petit bonus pour une barre de défilement élégante sur Chrome/Safari */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #CBD5E1;
}
</style>
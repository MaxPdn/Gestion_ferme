<script setup>
import { ref, onMounted, computed } from "vue";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../services/departmentService.js";
import { getCampaigns } from "../services/campaignService.js";
import Swal from "sweetalert2"; // Importation de SweetAlert2
import { useAutoRefresh } from "../composables/useAutoRefresh.js";

const { triggerRefresh, onRefresh } = useAutoRefresh();

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
    triggerRefresh();
  } catch (err) {
    alert(err.response?.data?.message || "Erreur création");
  } finally {
    creating.value = false;
  }
};

const saveEdit = async (id) => {
  if (!editedName.value.trim()) return;
  try {
    await updateDepartment(id, { name: editedName.value.trim() });
    cancelEdit();
    await fetchData();
    triggerRefresh();
  } catch (err) {
    alert(err.response?.data?.message || "Erreur mise à jour");
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
    title: "Êtes-vous sûr ?",
    text: `Le département "${name}" sera définitivement supprimée.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#2563eb", // Le bleu-600 de ton bouton "Nouvelle campagne"
    cancelButtonColor: "#94a3b8", // Un gris ardoise discret
    confirmButtonText: "Oui, supprimer",
    cancelButtonText: "Annuler",
    reverseButtons: true, // Met "Annuler" à gauche
    customClass: {
      popup: "rounded-3xl", // Pour matcher tes arrondis "rounded-3xl"
      confirmButton: "rounded-xl px-6 py-3 font-semibold",
      cancelButton: "rounded-xl px-6 py-3 font-semibold",
    },
  });

  // Si l'utilisateur a cliqué sur "Oui"
  if (result.isConfirmed) {
    try {
      await deleteDepartment(id);

      // Mise à jour de l'état local
      departments.value = departments.value.filter((c) => c._id !== id);
      triggerRefresh();

      // Notification de succès
      Swal.fire({
        title: "Supprimé !",
        text: "Le département a été retirée avec succès.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: "rounded-3xl" },
      });
    } catch (err) {
      console.error("Erreur suppression", err);
      Swal.fire({
        title: "Erreur",
        text: "Impossible de supprimer le département.",
        icon: "error",
        customClass: { popup: "rounded-3xl" },
      });
    }
  }
};

const searchQuery = ref("");

// Filtre la liste des départements en fonction de la saisie
const filteredDepartments = computed(() => {
  return departments.value.filter((dept) =>
    dept.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

onMounted(fetchData);
onRefresh(fetchData);

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount);
};
</script>

<template>
  <div class="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen p-4 md:p-8">
    <div class="max-w-7xl mx-auto space-y-8">
      
      <header class="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 class="text-2xl font-black text-slate-800 tracking-tight">Gestion des Départements</h1>
            <p class="text-slate-500 text-sm mt-1">Pilotez vos zones de production et campagnes</p>
          </div>
          
          <div class="flex gap-2">
            <input
              v-model="newDeptName"
              type="text"
              placeholder="Nom du département..."
              class="flex-1 md:w-64 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-semibold"
              @keyup.enter="handleCreate"
            />
            <button
              @click="handleCreate"
              :disabled="creating || !newDeptName"
              class="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-slate-200 active:scale-95 text-sm flex items-center gap-2"
            >
              <span v-if="creating" class="animate-spin">🌀</span>
              {{ creating ? "..." : "Ajouter" }}
            </button>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-12 gap-8">
        <aside class="col-span-12 lg:col-span-4 space-y-4">
          <div class="flex items-center justify-between px-2">
            <h2 class="text-lg font-bold text-slate-900">Départements</h2>
            <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ filteredDepartments.length }} Zones</span>
          </div>

          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher..."
              class="w-full px-4 py-3 text-sm font-semibold rounded-2xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>

          <div class="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            <div
              v-for="dept in filteredDepartments"
              :key="dept._id"
              @click="selectedDeptId = dept._id"
              :class="[
                'group p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between',
                selectedDeptId === dept._id
                  ? 'bg-white border-blue-600 shadow-md ring-1 ring-blue-600/5'
                  : 'bg-white/60 border-transparent text-slate-500 hover:bg-white hover:border-slate-200',
              ]"
            >
              <div class="flex items-center gap-3 flex-1 overflow-hidden">
                <div :class="selectedDeptId === dept._id ? 'text-blue-600' : 'text-slate-400'">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  </svg>
                </div>

                <input
                  v-if="editingId === dept._id"
                  v-model="editedName"
                  @click.stop
                  type="text"
                  class="bg-slate-100 border-none px-2 py-1 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 w-full text-sm"
                />
                <span v-else :class="['font-bold truncate text-sm', selectedDeptId === dept._id ? 'text-slate-900' : 'text-slate-600']">
                  {{ dept.name }}
                </span>
              </div>

              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" @click.stop>
                <template v-if="editingId === dept._id">
                  <button @click="saveEdit(dept._id)" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">✓</button>
                  <button @click="cancelEdit" class="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">✕</button>
                </template>
                <template v-else>
                  <button @click="startEdit(dept)" class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                  </button>
                  <button @click="handleDelete(dept._id, dept.name)" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </template>
              </div>
            </div>
          </div>
        </aside>

        <main class="col-span-12 lg:col-span-8">
          <div class="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col min-h-[600px] overflow-hidden">
            <div v-if="selectedDeptId" class="flex flex-col h-full">
              <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest">Campagnes Actives</h3>
                  <p class="text-lg font-bold text-slate-800">
                    Secteur : <span class="text-blue-600">{{ departments.find(d => d._id === selectedDeptId)?.name }}</span>
                  </p>
                </div>
                <div class="bg-[#1e293b] text-white px-4 py-1.5 rounded-full font-bold text-xs">
                  {{ filteredCampaigns.length }} Campagnes
                </div>
              </div>

              <div v-if="filteredCampaigns.length > 0" class="divide-y divide-slate-50 overflow-y-auto max-h-[500px] custom-scrollbar">
                <div v-for="camp in filteredCampaigns" :key="camp._id" class="p-6 hover:bg-slate-50/80 transition-all flex items-center justify-between group">
                  <div class="space-y-1">
                    <h4 class="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{{ camp.name }}</h4>
                    <div class="flex items-center gap-4 text-xs font-bold text-slate-500">
                      <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-orange-400"></span> Obj: {{ camp.objective }}</span>
                      <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Budget: {{ formatCurrency(camp.budget) }}</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-4">
                    <span :class="[
                      'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
                      camp.status === 'active' || camp.status === 'En cours' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                    ]">
                      {{ camp.status }}
                    </span>
                    <router-link :to="'/home/campaign/' + camp._id" class="p-2 bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </router-link>
                  </div>
                </div>
              </div>

              <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
                </div>
                <p class="text-slate-400 font-bold italic text-sm">Aucune campagne dans cette zone.</p>
                <router-link to="/home/create" class="mt-4 text-blue-600 font-black text-xs uppercase tracking-widest hover:text-blue-700 underline underline-offset-4">
                  + Créer une campagne
                </router-link>
              </div>
            </div>

            <div v-else class="flex-1 flex items-center justify-center p-12 text-slate-400 italic">
              Sélectionnez un département pour voir les détails
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
</style>

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
</script>

<template>
  <div class="p-8 font-serif bg-[#F8FAFC] min-h-screen font-sans">
    <div class="max-w-7xl mx-auto">
      <header
        class="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
      >
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">
            Configuration
          </h1>
          <p class="text-slate-500 font-medium">
            Gérez vos zones de production et flux actifs.
          </p>
        </div>
        <div class="flex gap-2 w-full md:w-auto">
          <input
            v-model="newDeptName"
            type="text"
            placeholder="Nouveau département..."
            class="flex-1 md:w-64 px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:'h-full [#1e293b] focus:'h-full [#1e293b] outline-none transition-all text-sm font-semibold"
            @keyup.enter="handleCreate"
          />
          <button
            @click="handleCreate"
            :disabled="creating || !newDeptName"
            class="'h-full bg-[#1e293b] hover:'h-full bg-[#1e293b] disabled:bg-slate-200 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-sm"
          >
            {{ creating ? "..." : "Ajouter" }}
          </button>
        </div>
      </header>
      <div class="grid grid-cols-12 gap-8 flex-col h-[600px] overflow-hidden">
        <aside class="col-span-12 lg:col-span-4 space-y-3">
          <h2 class="text-[18px] font-bold text-slate-900">Départements</h2>

          <div class="relative mb-4">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un département..."
              class="w-full px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white/50 focus:bg-white outline-none transition-all focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div
            v-for="dept in filteredDepartments"
            :key="dept._id"
            @click="selectedDeptId = dept._id"
            :class="[
              'group p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between',
              selectedDeptId === dept._id
                ? 'bg-white border-blue-600 shadow-md ring-1 ring-blue-600/5'
                : 'bg-white/60 border-transparent text-slate-500 hover:bg-white hover:border-slate-200',
            ]"
          >
            <div class="flex items-center gap-4 overflow-hidden">
              <span class="text-xl opacity-80">
                <svg
                  fill="#000000"
                  width="20px"
                  height="20px"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.04146 3C5.22009 2.6906 5.55022 2.5 5.90748 2.5L9.75278 2.5C10.11 2.5 10.4402 2.6906 10.6188 3L12.5415 6.33013C12.7201 6.63953 12.7201 7.02073 12.5415 7.33013L10.6188 10.6603C10.4402 10.9697 10.11 11.1603 9.75278 11.1603H5.90748C5.55022 11.1603 5.22009 10.9697 5.04146 10.6603L3.11881 7.33013C2.94017 7.02073 2.94017 6.63953 3.11881 6.33013L5.04146 3Z"
                  />
                  <path
                    d="M5.1216 13.2272C5.30023 12.9178 5.63036 12.7272 5.98762 12.7272H9.83292C10.1902 12.7272 10.5203 12.9178 10.6989 13.2272L12.6216 16.5574C12.8002 16.8668 12.8002 17.248 12.6216 17.5574L10.6989 20.8875C10.5203 21.1969 10.1902 21.3875 9.83292 21.3875H5.98762C5.63036 21.3875 5.30023 21.1969 5.1216 20.8875L3.19895 17.5574C3.02031 17.248 3.02031 16.8668 3.19895 16.5574L5.1216 13.2272Z"
                  />
                  <path
                    d="M14.1216 8.22723C14.3002 7.91783 14.6304 7.72723 14.9876 7.72723L18.8329 7.72723C19.1902 7.72723 19.5203 7.91783 19.6989 8.22723L21.6216 11.5574C21.8002 11.8668 21.8002 12.248 21.6216 12.5574L19.6989 15.8875C19.5203 16.1969 19.1902 16.3875 18.8329 16.3875H14.9876C14.6304 16.3875 14.3002 16.1969 14.1216 15.8875L12.1989 12.5574C12.0203 12.248 12.0203 11.8668 12.1989 11.5574L14.1216 8.22723Z"
                  />
                </svg>
              </span>

              <input
                v-if="editingId === dept._id"
                v-model="editedName"
                @click.stop
                type="text"
                class="bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg focus:outline-none font-bold text-slate-800 w-full text-sm"
              />
              <span
                v-else
                :class="[
                  'text-[16px] font-bold truncate text-sm transition-colors',
                  selectedDeptId === dept._id
                    ? 'text-[#1e293b]'
                    : 'text-slate-400',
                ]"
              >
                {{ dept.name }}
              </span>
            </div>

            <div class="flex gap-1 shrink-0 ml-4" @click.stop>
              <template v-if="editingId === dept._id">
                <button
                  @click="saveEdit(dept._id)"
                  class="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 text-[12px] font-bold"
                >
                  Enregistrer
                </button>
                <button
                  @click="cancelEdit"
                  class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 text-[12px] font-bold"
                >
                  Annuler
                </button>
              </template>
              <template v-else>
                <button
                  @click="startEdit(dept)"
                  class="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-100 transition text-slate-400 hover:text-blue-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
                <button
                  @click="handleDelete(dept._id, dept.name)"
                  class="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition text-slate-300 hover:text-red-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </template>
            </div>
          </div>

          <p
            v-if="filteredDepartments.length === 0"
            class="text-center text-xs text-slate-400 italic py-4"
          >
            Aucun département trouvé...
          </p>
        </aside>

        <main class="col-span-12 lg:col-span-8">
          <div
            class="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[600px] overflow-hidden"
          >
            <div v-if="selectedDeptId" class="flex flex-col h-full">
              <div
                class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0"
              >
                <h2 class="text-lg font-bold text-slate-800">
                  Campagnes du département
                  <span class="text-blue-600 not-italic">{{
                    departments.find((d) => d._id === selectedDeptId)?.name
                  }}</span>
                </h2>
                <span
                  class="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold text-[12px] uppercase tracking-tighter"
                >
                  Nombre total : {{ filteredCampaigns.length }}
                </span>
              </div>

              <div
                v-if="filteredCampaigns.length > 0"
                class="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-50"
              >
                <div
                  v-for="camp in filteredCampaigns"
                  :key="camp._id"
                  class="p-6 hover:bg-slate-50/80 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4
                      class="font-bold text-slate-800 group-hover:text-blue-600 transition-colors"
                    >
                      {{ camp.name }}
                    </h4>
                    <div
                      class="flex gap-6 mt-2 text-[14px] text-slate-900 font-bold"
                    >
                      <span class="flex items-center gap-1.5"
                        ><i class="opacity-100 text-[#F97316]">
                          <svg
                            class="fill-current"
                            width="20px"
                            height="20px"
                            viewBox="0 0 64 64"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M32,0c-8.477,0-16.178,3.302-21.903,8.683L9,7.585V4.999c0-0.168-0.051-0.318-0.124-0.457 C8.862,4.479,8.827,4.411,8.747,4.331L4.708,0.292H4.707C4.526,0.11,4.276-0.001,4-0.001c-0.553,0-1,0.447-1,1v2H1 c-0.553,0-1,0.447-1,1c0,0.276,0.112,0.526,0.293,0.707v0.001l3.999,3.998c0.001,0.001,0.001,0.001,0.001,0.001l0.041,0.041 c0.08,0.08,0.147,0.115,0.21,0.129C4.682,8.948,4.833,8.999,5,8.999h2.586l1.097,1.098C3.303,15.821,0,23.522,0,32 c0,17.673,14.327,32,32,32s32-14.327,32-32S49.673,0,32,0z M32,59.999c-15.464,0-28-12.536-28-28c0-7.372,2.854-14.074,7.511-19.075 l2.828,2.829C10.405,20.026,8,25.731,8,31.999c0,13.255,10.745,24,24,24s24-10.745,24-24s-10.745-24-24-24 c-6.268,0-11.972,2.404-16.247,6.34l-2.828-2.829c5-4.657,11.703-7.511,19.075-7.511c15.464,0,28,12.536,28,28 S47.464,59.999,32,59.999z M20.013,21.426C17.523,24.247,16,27.94,16,31.999c0,8.837,7.163,16,16,16s16-7.163,16-16s-7.163-16-16-16 c-4.059,0-7.752,1.523-10.573,4.013l-2.828-2.828c3.548-3.212,8.238-5.185,13.401-5.185c11.046,0,20,8.954,20,20s-8.954,20-20,20 s-20-8.954-20-20c0-5.163,1.973-9.854,5.185-13.401L20.013,21.426z M25.687,27.1C24.633,28.454,24,30.151,24,32c0,4.418,3.582,8,8,8 s8-3.582,8-8s-3.582-8-8-8c-1.848,0-3.545,0.633-4.899,1.686l-2.845-2.845c2.091-1.77,4.791-2.842,7.744-2.842 c6.627,0,12,5.373,12,12s-5.373,12-12,12s-12-5.373-12-12c0-2.953,1.072-5.653,2.842-7.744L25.687,27.1z M31.293,32.706 c0.391,0.391,1.023,0.391,1.414,0s0.391-1.023,0-1.414l-2.727-2.727C30.575,28.215,31.26,28,32,28c2.209,0,4,1.791,4,4s-1.791,4-4,4 s-4-1.791-4-4c0-0.741,0.215-1.426,0.566-2.021L31.293,32.706z"
                            />
                          </svg>
                        </i>
                        Objectif :
                        <span class="text-slate-600">{{
                          camp.objective
                        }}</span></span
                      >
                      <span class="flex items-center gap-1.5"
                        ><i
                          class="flex items-center justify-center text-slate-400 hover:text-[#F97316] transition-colors duration-200"
                        >
                          <svg
                            class="fill-current"
                            width="30px"
                            height="30px"
                            viewBox="0 0 32 32"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <title>graph</title>
                            <path
                              d="M0 25.406h22.406v-1.75h-20.656v-17.063h-1.75v18.813zM3.063 21.969h19.25v-13.813l-4.063 3.719-3.781-1.375-4 4.563-4.094-1.469-3.313 3.438v4.938z"
                            ></path>
                          </svg>
                        </i>
                        Restes :
                        <span class="text-emerald-600">{{
                          camp.currentCount
                        }}</span></span
                      >
                    </div>
                  </div>

                  <div class="flex items-center gap-4">
                    <span
                      :class="[
                        'px-3 py-1 rounded text-[12px] font-black uppercase tracking-tighter',
                        camp.status === 'active'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-100 text-slate-500',
                      ]"
                    >
                      {{ camp.status }}
                    </span>
                    <router-link
                      :to="'/campaign/' + camp._id"
                      class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </router-link>
                  </div>
                </div>
              </div>

              <div
                v-else
                class="flex-1 flex flex-col items-center justify-center text-center p-10"
              >
                <div
                  class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-4 grayscale text-slate-300 italic"
                >
                  <svg
                    height="120px"
                    width="120px"
                    version="1.1"
                    id="图层_1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 40 40"
                    enable-background="new 0 0 40 40"
                    xml:space="preserve"
                  >
                    <g>
                      <g>
                        <g>
                          <g>
                            <path
                              fill="#231815"
                              d="M20,28.5c-4.7,0-8.5-3.8-8.5-8.5s3.8-8.5,8.5-8.5s8.5,3.8,8.5,8.5S24.7,28.5,20,28.5z M20,12.5
					c-4.1,0-7.5,3.4-7.5,7.5s3.4,7.5,7.5,7.5s7.5-3.4,7.5-7.5S24.1,12.5,20,12.5z"
                            />
                          </g>
                        </g>
                        <g>
                          <path
                            fill="#231815"
                            d="M20,26.5c-3.6,0-6.5-2.9-6.5-6.5c0-1.3,0.4-2.6,1.2-3.8c0.1-0.1,0.2-0.2,0.4-0.2c0.1,0,0.3,0,0.4,0.1
				l8.3,8.3c0.1,0.1,0.2,0.2,0.1,0.4c0,0.1-0.1,0.3-0.2,0.4C22.6,26.1,21.3,26.5,20,26.5z M15.2,17.3c-0.5,0.8-0.7,1.7-0.7,2.7
				c0,3,2.5,5.5,5.5,5.5c0.9,0,1.9-0.2,2.7-0.7L15.2,17.3z"
                          />
                        </g>
                        <g>
                          <path
                            fill="#231815"
                            d="M24.9,24c-0.1,0-0.3-0.1-0.4-0.1l-8.3-8.3c-0.1-0.1-0.2-0.2-0.1-0.4c0-0.1,0.1-0.3,0.2-0.4
				c1.1-0.8,2.4-1.2,3.8-1.2c3.6,0,6.5,2.9,6.5,6.5c0,1.3-0.4,2.6-1.2,3.8C25.2,23.9,25.1,24,24.9,24C24.9,24,24.9,24,24.9,24z
				 M17.3,15.2l7.5,7.5c0.5-0.8,0.7-1.7,0.7-2.7c0-3-2.5-5.5-5.5-5.5C19.1,14.5,18.1,14.7,17.3,15.2z"
                          />
                        </g>
                      </g>
                    </g>
                  </svg>
                </div>
                <p class="text-slate-400 font-bold italic text-sm">
                  Aucune campagne dans cette zone.
                </p>
                <router-link
                  to="/create"
                  class="mt-4 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
                >
                  + Créer une campagne
                </router-link>
              </div>
            </div>

            <div
              v-else
              class="flex flex-col items-center justify-center h-full text-slate-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-12 w-12 mb-4 opacity-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"
                />
              </svg>
              <p
                class="font-bold uppercase tracking-widest text-[11px] text-slate-400"
              >
                Sélectionnez un département à gauche
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
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
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>

<script setup>
import { ref, onMounted, computed } from "vue";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../services/departmentService.js";
import { getCampaigns } from "../services/campaignService.js";

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

const handleDelete = async (id) => {
  if (!confirm("Supprimer ce département ?")) return;
  try {
    await deleteDepartment(id);
    if (selectedDeptId.value === id) selectedDeptId.value = null;
    await fetchData();
  } catch (err) {
    alert(err.response?.data?.message || "Erreur suppression");
  }
};

onMounted(fetchData);
</script>

<template>
  <div class="p-8 bg-[#F8FAFC] min-h-screen font-sans">
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
            class="flex-1 md:w-64 px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-semibold"
            @keyup.enter="handleCreate"
          />
          <button
            @click="handleCreate"
            :disabled="creating || !newDeptName"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-sm"
          >
            {{ creating ? "..." : "Ajouter" }}
          </button>
        </div>
      </header>

      <div class="grid grid-cols-12 gap-8">
        <aside class="col-span-12 lg:col-span-4 space-y-3">
          <h3
            class="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-4"
          >
            Zones de production
          </h3>

          <div
            v-for="dept in departments"
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
              <span class="text-xl opacity-80">{{
                selectedDeptId === dept._id ? "📁" : "📂"
              }}</span>

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
                  'font-bold truncate text-sm transition-colors',
                  selectedDeptId === dept._id
                    ? 'text-blue-600'
                    : 'text-slate-600',
                ]"
              >
                {{ dept.name }}
              </span>
            </div>

            <div class="flex gap-1 shrink-0 ml-4" @click.stop>
              <template v-if="editingId === dept._id">
                <button
                  @click="saveEdit(dept._id)"
                  class="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600"
                >
                  ✅
                </button>
                <button
                  @click="cancelEdit"
                  class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                  ❌
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
                  @click="handleDelete(dept._id)"
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
        </aside>

        <main class="col-span-12 lg:col-span-8">
          <div
            class="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[600px] overflow-hidden"
          >
            <div v-if="selectedDeptId" class="flex flex-col h-full">
              <div
                class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0"
              >
                <h2
                  class="text-lg font-bold text-slate-800 tracking-tight italic"
                >
                  Campagnes à
                  <span class="text-blue-600 not-italic">{{
                    departments.find((d) => d._id === selectedDeptId)?.name
                  }}</span>
                </h2>
                <span
                  class="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold text-[11px] uppercase tracking-tighter"
                >
                  {{ filteredCampaigns.length }} au total
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
                      class="font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors"
                    >
                      {{ camp.name }}
                    </h4>
                    <div
                      class="flex gap-6 mt-2 text-[11px] text-slate-400 font-bold uppercase tracking-widest"
                    >
                      <span class="flex items-center gap-1.5"
                        ><i class="opacity-50 text-base">🎯</i> Objectif:
                        <span class="text-slate-600">{{
                          camp.objective
                        }}</span></span
                      >
                      <span class="flex items-center gap-1.5"
                        ><i class="opacity-50 text-base">📈</i> En vie:
                        <span class="text-emerald-600">{{
                          camp.currentCount
                        }}</span></span
                      >
                    </div>
                  </div>

                  <div class="flex items-center gap-4">
                    <span
                      :class="[
                        'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter',
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
                  🍃
                </div>
                <p class="text-slate-400 font-bold italic text-sm">
                  Aucune campagne dans cette zone.
                </p>
                <router-link
                  to="/create"
                  class="mt-4 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
                >
                  + Créer un flux
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
  background: #E2E8F0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #CBD5E1;
}
</style>
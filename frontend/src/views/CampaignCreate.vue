<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { createCampaign } from "../services/campaignService";
import { getDepartments } from "../services/departmentService";

const router = useRouter();

const form = ref({
  name: "",
  department: "",
  startDate: "",
  objective: "",
  initialCount: "",
  budget: "",
});

const departments = ref([]);
const loading = ref(false);
const error = ref("");

const fetchDepartments = async () => {
  try {
    const res = await getDepartments();
    departments.value = res.data;
    if (res.data.length > 0) {
      form.value.department = res.data[0]._id;
    }
  } catch (err) {
    console.error("Erreur chargement départements", err);
    error.value = "Impossible de charger les départements";
  }
};

onMounted(fetchDepartments);

const handleSubmit = async () => {
  error.value = "";

  if (!form.value.name || !form.value.startDate || !form.value.objective || !form.value.initialCount) {
    error.value = "Veuillez remplir tous les champs obligatoires";
    return;
  }

  try {
    loading.value = true;
    await createCampaign({
      ...form.value,
      startDate: new Date(form.value.startDate),
      objective: Number(form.value.objective),
      initialCount: Number(form.value.initialCount),
      budget: Number(form.value.budget || 0),
    });
    router.push("/campaigns");
  } catch (err) {
    error.value = err.response?.data?.message || "Erreur lors de la création";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen font-serif flex items-center justify-center bg-[#F8FAFC] p-4 md:p-12 font-sans antialiased text-slate-900">
    <div class="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl shadow-slate-100/70 border border-slate-100 overflow-hidden">
      
      <header class="relative px-6 md:px-12 py-8 bg-white border-b border-slate-100">
        <button 
          @click="router.back()" 
          class="absolute top-10 left-6 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors group"
          title="Annuler et retourner"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div class="text-center">
          <h1 class="text-3xl font-serif font-black tracking-tight text-slate-900">Nouvelle Campagne</h1>
          <p class="text-slate-500 mt-2 font-serif font-medium">Configurez votre nouveau cycle d'élevage</p>
        </div>
      </header>

      <div class="p-8 md:p-12 space-y-10">

        <transition enter-active-class="animate-fade-in-down" leave-active-class="opacity-0 transition duration-300">
          <div v-if="error" class="flex items-center gap-3 p-4 rounded-xl bg-red-50/50 border border-red-100 text-red-600">
            <span class="text-lg">⚠️</span>
            <p class="text-sm font-bold">{{ error }}</p>
          </div>
        </transition>

        <div class="grid gap-10">
          
          <div class="space-y-3">
            <label class="text-[16px] font-black text-slate-700">Désignation de la Campagne *</label>
            <div class="relative group">
              <input
                v-model="form.name"
                type="text"
                placeholder="Campagne Mars"
                class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-8">
            <div class="space-y-3 relative">
              <label class="text-[16px] font-black text-slate-700">Département *</label>
              <select
                v-model="form.department"
                class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none appearance-none transition-all cursor-pointer placeholder:text-slate-300"
              >
                <option disabled value="">Sélectionner un site</option>
                <option v-for="dept in departments" :key="dept._id" :value="dept._id">{{ dept.name }}</option>
              </select>
              <div class="absolute inset-y-0 right-0 pr-5 pt-7 flex items-center pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <p v-if="departments.length === 0" class="text-red-500 text-[10px] font-black uppercase mt-1">Aucun département disponible</p>
            </div>

            <div class="space-y-3">
              <label class="text-[16px] font-black text-slate-700">Date de mise en place *</label>
              <input
                v-model="form.startDate"
                type="date"
                class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <div class="space-y-2">
              <label class="text-[16px] font-black text-slate-700">Objectif</label>
              <input
                v-model="form.objective"
                type="number"
                placeholder="Cible"
                class="w-full p-4 text-center font-black text-lg bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-all placeholder:font-normal placeholder:text-slate-300"
              />
            </div>

            <div class="space-y-2">
              <label class="text-[16px] font-black text-slate-700">Effectif Initial</label>
              <input
                v-model="form.initialCount"
                type="number"
                placeholder="Quantité"
                class="w-full p-4 text-center font-black text-lg bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-all placeholder:font-normal placeholder:text-slate-300"
              />
            </div>

            <div class="space-y-2">
              <label class="text-[16px] font-black text-slate-700">Budget (CFA)</label>
              <input
                v-model="form.budget"
                type="number"
                placeholder="Montant"
                class="w-full p-4 text-center font-black text-lg bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-all text-blue-600 placeholder:font-normal placeholder:text-slate-300"
              />
            </div>
          </div>
        </div>

        <button
          @click="handleSubmit"
          :disabled="loading || !form.department"
          class="group w-full flex items-center justify-center gap-3 py-5 font-black text-white bg-blue-600 rounded-1xxl shadow-xl shadow-blue-500/30 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:bg-slate-200 disabled:shadow-none overflow-hidden"
        >
          <div v-if="!loading" class="flex items-center gap-3">
            <span>Lancer la campagne</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 5l7 7-7 7" />
            </svg>
          </div>
          
          <div v-else class="flex items-center gap-3">
            <svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Initialisation du cycle...</span>
          </div>
        </button>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Pour supprimer les flèches des inputs number */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

@keyframes fade-in-down {
  0% { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-down {
  animation: fade-in-down 0.4s ease-out;
}
</style>
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
  <div class="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      
      <div class="bg-blue-600 p-8 text-white relative">
        <button @click="router.back()" class="absolute top-8 left-4 p-2 hover:bg-blue-500 rounded-full transition">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
           </svg>
        </button>
        <div class="text-center">
          <h1 class="text-3xl font-black">Nouvelle Campagne</h1>
          <p class="text-blue-100 mt-2 font-medium">Configurez votre nouveau cycle d'élevage</p>
        </div>
      </div>

      <div class="p-8">
        <transition enter-active-class="animate-bounce" leave-active-class="opacity-0 transition duration-300">
          <div v-if="error" class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3">
            <span>⚠️</span>
            <p class="text-sm font-bold">{{ error }}</p>
          </div>
        </transition>

        <div class="space-y-6">
          <div class="space-y-2">
            <label class="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Nom de la Campagne *</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">📝</span>
              <input v-model="form.name" type="text" placeholder="Ex: Lot Porcin Été 2026" 
                class="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-2xl transition-all outline-none border text-gray-700 font-medium" />
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Département *</label>
              <select v-model="form.department" class="w-full p-4 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-2xl transition-all outline-none border text-gray-700 font-medium appearance-none">
                <option disabled value="">Choisir un lieu...</option>
                <option v-for="dept in departments" :key="dept._id" :value="dept._id">{{ dept.name }}</option>
              </select>
              <p v-if="departments.length === 0" class="text-red-500 text-[10px] font-bold mt-1">Aucun département trouvé.</p>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Date de début *</label>
              <input v-model="form.startDate" type="date" 
                class="w-full p-4 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-2xl transition-all outline-none border text-gray-700 font-medium" />
            </div>
          </div>

          <div class="grid md:grid-cols-3 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Objectif</label>
              <input v-model="form.objective" type="number" placeholder="Cible" 
                class="w-full p-4 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-2xl transition-all border outline-none font-bold text-center" />
            </div>

            <div class="space-y-2">
              <label class="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Effectif</label>
              <input v-model="form.initialCount" type="number" placeholder="Quantité" 
                class="w-full p-4 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-2xl transition-all border outline-none font-bold text-center" />
            </div>

            <div class="space-y-2">
              <label class="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Budget</label>
              <input v-model="form.budget" type="number" placeholder="CFA / €" 
                class="w-full p-4 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-2xl transition-all border outline-none font-bold text-center" />
            </div>
          </div>

          <button
            @click="handleSubmit"
            :disabled="loading || !form.department"
            class="group w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white font-black py-5 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <span v-if="!loading" class="flex items-center gap-2">
              Lancer la campagne
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7" />
              </svg>
            </span>
            <span v-else class="flex items-center gap-2">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Génération des animaux...
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
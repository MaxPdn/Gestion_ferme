<template>
  <div class="p-4 md:p-8 font-serif space-y-6 font-sans antialiased text-slate-900">
    
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
      <div>
        <h1 class="text-3xl font-[800] text-[#1e293b]">Alertes Sanitaires</h1>
        <p class="text-slate-500 font-medium mt-1">Surveillance automatique du bétail</p>
      </div>
      
      <div v-if="criticalAlerts.length > 0" class="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-2xl border border-red-100 shadow-sm">
        <span class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
        </span>
        <span class="font-black text-sm">{{ criticalAlerts.length }} Campagnes à risque</span>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
      <div class="animate-spin h-10 w-10 border-4 border-[#F97316] border-t-transparent rounded-full"></div>
      <p class="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Analyse de la base de données...</p>
    </div>

    <div v-else-if="error" class="p-6 bg-red-50 border border-red-100 rounded-[2rem] text-center">
      <p class="text-red-600 font-bold">{{ error }}</p>
      <button @click="fetchCampaigns" class="mt-4 text-sm font-black text-red-700 underline">Réessayer</button>
    </div>

    <div v-else-if="criticalAlerts.length > 0" class="grid gap-6">
      <div 
        v-for="alert in criticalAlerts" 
        :key="alert._id"
        class="group relative flex flex-col md:flex-row md:items-center justify-between bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:border-red-100 transition-all duration-300"
      >
        <div class="absolute left-0 top-1/2 -translate-y-1/2 h-16 w-1.5 bg-red-500 rounded-r-full"></div>

        <div class="flex items-center gap-6">
          <div class="hidden md:flex p-5 bg-red-50 rounded-[1.5rem] text-red-500 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div>
            <h3 class="text-xl font-[800] text-slate-800 group-hover:text-red-600 transition-colors">{{ alert.name }}</h3>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-[14px] font-black text-slate-700">Département :</span>
              <span class="text-[14px] font-black text-[#1e293b] bg-slate-100 px-2 py-0.5 rounded-md">
                {{ alert.department?.name || 'Non assigné' }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-8 mt-6 md:mt-0">
          <div class="flex gap-10">
            <div class="text-center">
              <p class="text-[18px] font-black text-slate-700">Mortalité</p>
              <p class="text-3xl font-[900] text-red-600">{{ alert.mortalityRate }}%</p>
            </div>
            
            <div class="text-center border-x border-slate-100 px-10">
              <p class="text-[18px] font-black text-slate-700">Pertes / Total</p>
              <p class="text-3xl font-[900] text-slate-800">{{ alert.losses }}<span class="text-slate-300 mx-1">/</span>{{ alert.initialCount }}</p>
            </div>
          </div>

          <button 
            @click="inspectCampaign(alert._id)"
            class="h-[60px] bg-[#1e293b] hover:bg-[#F97316] text-white font-bold px-8 rounded-2xl transition-all active:scale-95 shadow-lg shadow-slate-900/10 flex items-center gap-3 whitespace-nowrap"
          >
            <span>Inspecter</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-sm text-center">
      <div class="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-2xl font-black text-slate-800">Aucune alerte détectée</h3>
      <p class="text-slate-500 font-medium mt-2 max-w-xs">Le taux de mortalité de toutes les campagnes est actuellement sous le seuil critique (5%).</p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from "vue-router";

const router = useRouter();
// --- État des données ---
const campaigns = ref([]);
const loading = ref(true);
const error = ref(null);

// --- Configuration ---
const MORTALITY_THRESHOLD = 5; // Seuil de 5%

// --- Logique métier ---
const criticalAlerts = computed(() => {
  if (!campaigns.value.length) return [];

  return campaigns.value
    .map(campaign => {
      // Calculer le taux dynamiquement pour chaque campagne
      const rate = campaign.initialCount > 0 
        ? ((campaign.losses / campaign.initialCount) * 100).toFixed(2) 
        : 0;
      
      return { ...campaign, mortalityRate: rate };
    })
    // On ne garde que ceux qui dépassent le seuil
    .filter(c => parseFloat(c.mortalityRate) >= MORTALITY_THRESHOLD)
    // Trier par gravité (plus gros taux en premier)
    .sort((a, b) => b.mortalityRate - a.mortalityRate);
});

// --- Actions API ---
const fetchCampaigns = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Remplace par ton URL réelle
    const response = await fetch('http://localhost:7000/api/campaigns'); 
    
    if (!response.ok) throw new Error('Impossible de charger les données sanitaires.');
    
    const data = await response.json();
    campaigns.value = data;
  } catch (err) {
    error.value = err.message;
    console.error("Erreur Alertes:", err);
  } finally {
    loading.value = false;
  }
};

const inspectCampaign = (id) => {
  // Navigation vers la page de détails de la campagne
  router.push(`/campaign/${id}`);
};

// --- Cycle de vie ---
onMounted(() => {
  fetchCampaigns();
});
</script>

<style scoped>
/* Petit effet de pulse sur le badge rouge pour attirer l'oeil */
.animate-ping {
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from "vue-router";
import { notify } from '@/composables/useNotify';

const router = useRouter();
const stats = ref([]);
const series = ref([{ name: 'Pertes', data: [] }]);
const topAlerts = ref([]); 
const isLoading = ref(true);

// --- États pour la modale de saisie rapide ---
const isModalOpen = ref(false);
const allCampaigns = ref([]);
const selectedCampaign = ref("");
const lossQuantity = ref(1);

// 1. Générateur de jours dynamiques pour ApexCharts
const generateDayLabels = () => {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const labels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(days[d.getDay()]);
  }
  return labels;
};

const fetchDashboardData = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:7000/api/campaigns/dashboard-stats", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    stats.value = res.data.stats || [];
    series.value[0].data = res.data.chartData || [];
    topAlerts.value = res.data.topAlerts || []; 
    
    // On récupère aussi la liste simple des campagnes pour la modale
    const campRes = await axios.get("http://localhost:7000/api/campaigns", {
        headers: { Authorization: `Bearer ${token}` }
    });
    allCampaigns.value = campRes.data;

    isLoading.value = false;
  } catch (err) {
    console.error("Erreur lors de la récupération des stats:", err);
    isLoading.value = false;
  }
};

const submitLoss = async () => {
  // Vérification avant même d'envoyer au serveur (Optionnel mais recommandé)
  const currentCampaign = allCampaigns.value.find(c => c._id === selectedCampaign.value);
  
  if (lossQuantity.value > currentCampaign.currentCount) {
    return notify(`Impossible : il ne reste que ${currentCampaign.currentCount} animaux.`);
  }

  try {
    const token = localStorage.getItem("token");
    await axios.post(`http://localhost:7000/api/campaigns/${selectedCampaign.value}/losses`, 
      { quantity: lossQuantity.value },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    notify("Perte enregistrée avec succès ! ✅"); // Notification de succès
    isModalOpen.value = false;
    await fetchDashboardData(); 
  } catch (err) {
    // Notification d'erreur venant du backend
    notify(err.response?.data?.message || "Une erreur est survenue");
  }
};

onMounted(fetchDashboardData);

const showLogoutModal = ref(false);

const requestLogout = () => {
  showLogoutModal.value = true;
};

const cancelLogout = () => {
  showLogoutModal.value = false;
};

const confirmLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  showLogoutModal.value = false;
  router.push("/");
};

const currentDate = new Date().toLocaleDateString('fr-FR', { 
  weekday: 'long', day: 'numeric', month: 'long' 
});

const chartOptions = ref({
  chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
  colors: ['#1e293b'],
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 90, 100] }
  },
  dataLabels: { enabled: false },
  xaxis: { 
    categories: generateDayLabels(), // 🔥 Jours dynamiques ici
    labels: { style: { colors: '#94a3b8', fontWeight: 600 } } 
  },
  grid: { borderColor: '#f1f5f9' }
});
</script>

<template>
  <div v-if="isLoading" class="h-screen flex items-center justify-center bg-slate-50">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e293b]"></div>
  </div>

  <div v-else class="dashboard-container min-h-screen bg-slate-50 antialiased text-slate-900">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-12">
      <div>
        <h2 class="dashboard-subtitle uppercase tracking-widest">Tableau de Bord</h2>
        <h1 class="dashboard-title">Bonjour</h1>
        <p class="dashboard-card-text mt-1">{{ currentDate }} • <span class="text-orange-500">TerraCore</span></p>
      </div>
      
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        <button @click="isModalOpen = true" class="w-full sm:w-auto btn rounded-2xl hover:shadow-lg transition-all shadow-slate-200 flex items-center justify-center gap-2 active:scale-95">
          <span class="text-xl">+</span> 
          <span>Déclarer une perte</span>
        </button>

        <button @click="requestLogout" class="w-full sm:w-auto btn rounded-2xl shadow-sm active:scale-95">
          <span>Déconnexion</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
      <div v-for="stat in stats" :key="stat.label" class="bg-white p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white transition-all hover:translate-y-[-4px]">
        <p class="dashboard-card-title uppercase tracking-widest mb-2 md:mb-3 leading-tight">{{ stat.label }}</p>
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-1">
          <span class="text-xl md:text-2xl font-black text-[#1e293b]">{{ stat.value }}</span>
          <span :class="stat.trendColor" class="text-xs font-black px-2 md:px-3 py-1 rounded-full bg-opacity-10 w-fit">
            {{ stat.trend }}
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      
      <div class="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white">
        <div class="flex justify-between items-center mb-6 md:mb-8">
          <h3 class="dashboard-card-title">Évolution de la mortalité</h3>
        </div>
        <div class="h-60 md:h-72">
          <apexchart width="100%" height="100%" :options="chartOptions" :series="series"></apexchart>
        </div>
      </div>

      <div class="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white">
        <h3 class="dashboard-card-title mb-6 md:mb-8">Urgences</h3>
        <div class="space-y-3 md:space-y-4">
          <div v-for="alert in topAlerts" :key="alert.id" 
               @click="router.push(`/home/campaign/${alert.id}`)"
               class="group flex items-center justify-between p-4 md:p-5 bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] border border-transparent hover:border-red-100 hover:bg-red-50/50 transition-all cursor-pointer">
            <div class="flex items-center gap-3 md:gap-4">
              <div class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl md:rounded-2xl shadow-sm flex-shrink-0">
                <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              </div>
              <div class="min-w-0">
                <p class="font-bold text-slate-800 text-xs md:text-sm truncate">{{ alert.building }}</p>
                <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-tight">Seuil critique</p>
              </div>
            </div>
            <p class="text-red-600 font-[900] text-lg md:text-xl ml-2">{{ alert.rate }}%</p>
          </div>

          <div v-if="!topAlerts || topAlerts.length === 0" class="text-center py-8">
            <p class="text-slate-400 font-bold text-sm italic">Tout est sous contrôle ✅</p>
          </div>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="isModalOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 w-full max-w-md shadow-2xl border border-white max-h-[90vh] overflow-y-auto">
          <h3 class="dashboard-card-title mb-2">Nouvelle Perte</h3>
          <p class="dashboard-card-text mb-6 md:mb-8 font-medium leading-relaxed">Mise à jour de l'inventaire en direct.</p>
          
          <div class="space-y-4 md:space-y-6">
            <div>
              <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Sélectionner le bâtiment</label>
              <select v-model="selectedCampaign" class="w-full bg-slate-50 border-none rounded-xl md:rounded-2xl p-4 mt-2 outline-none focus:ring-2 focus:ring-slate-100 font-bold text-slate-700 text-sm md:text-base">
                <option value="" disabled>Choisir un lot...</option>
                <option v-for="c in allCampaigns" :key="c._id" :value="c._id">{{ c.name }}</option>
              </select>
            </div>
            
            <div>
              <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Nombre de têtes</label>
              <input v-model="lossQuantity" type="number" class="w-full bg-slate-50 border-none rounded-xl md:rounded-2xl p-4 mt-2 outline-none focus:ring-2 focus:ring-slate-100 font-bold text-slate-700 text-sm md:text-base" />
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-2 md:gap-4 mt-8 md:mt-10">
            <button @click="isModalOpen = false" class="order-2 sm:order-1 flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors">Annuler</button>
            <button @click="submitLoss" class="order-1 sm:order-2 flex-1 py-4 font-bold bg-red-500 text-white rounded-xl md:rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-100 active:scale-95">Confirmer</button>
          </div>
        </div>
      </div>
    </Transition>

    <transition name="fade">
      <div v-if="showLogoutModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div class="w-[90vw] max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
          <h3 class="text-lg font-black text-slate-900 mb-2">Confirmation de déconnexion</h3>
          <p class="text-sm text-slate-600 mb-5">Voulez-vous vraiment vous déconnecter ?</p>
          <div class="flex justify-end gap-3">
            <button @click="cancelLogout" class="btn bg-slate-200 text-slate-700 hover:bg-slate-300">Annuler</button>
            <button @click="confirmLogout" class="btn bg-red-500 text-white hover:bg-red-600">Déconnexion</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>
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

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
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

  <div v-else class="min-h-screen font-serif bg-slate-50 p-6 md:p-10 font-sans antialiased text-slate-900">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
      <div>
        <h2 class="text-slate-900 font-bold uppercase text-[16px]">Tableau de Bord</h2>
        <h1 class="text-4xl font-black text-[#1e293b] tracking-tight">Bonjour, Admin 👋</h1>
        <p class="text-slate-500 font-medium mt-1">{{ currentDate }} • <span class="text-[#F97316]">TerraCore</span></p>
      </div>
      
      <div class="flex items-center gap-3">
        <button @click="isModalOpen = true" class="bg-[#1e293b] text-white font-bold px-6 py-3 rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center gap-2 active:scale-95">
          <span class="text-xl">+</span> 
          <span class="hidden sm:inline">Déclarer une perte</span>
        </button>

        <button @click="logout" class="group flex items-center gap-3 bg-white border border-slate-200 text-slate-600 font-bold px-6 py-3 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all shadow-sm active:scale-95">
          <span>Déconnexion</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <div v-for="stat in stats" :key="stat.label" class="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white transition-all hover:translate-y-[-4px]">
        <p class="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-3">{{ stat.label }}</p>
        <div class="flex items-end justify-between">
          <span class="text-3xl font-[900] text-[#1e293b]">{{ stat.value }}</span>
          <span :class="stat.trendColor" class="text-[10px] font-black px-3 py-1 rounded-full bg-opacity-10 mb-1">
            {{ stat.trend }}
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <div class="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white">
        <div class="flex justify-between items-center mb-8">
          <h3 class="text-xl font-black text-[#1e293b]">Évolution de la mortalité</h3>
        </div>
        <div class="h-72">
          <apexchart width="100%" height="100%" :options="chartOptions" :series="series"></apexchart>
        </div>
      </div>

      <div class="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white">
        <h3 class="text-xl font-black text-[#1e293b] mb-8">Urgences</h3>
        <div class="space-y-4">
          <div v-for="alert in topAlerts" :key="alert.id" 
               @click="router.push(`/campaign/${alert.id}`)"
               class="group flex items-center justify-between p-5 bg-slate-50 rounded-[2rem] border border-transparent hover:border-red-100 hover:bg-red-50/50 transition-all cursor-pointer">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 flex items-center justify-center bg-white rounded-2xl shadow-sm">
                <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              </div>
              <div>
                <p class="font-bold text-slate-800 text-sm">{{ alert.building }}</p>
                <p class="text-[10px] font-black text-slate-400 uppercase">Seuil critique</p>
              </div>
            </div>
            <p class="text-red-600 font-[900] text-xl">{{ alert.rate }}%</p>
          </div>

          <div v-if="!topAlerts || topAlerts.length === 0" class="text-center py-10">
            <p class="text-slate-400 font-bold text-sm italic">Tout est sous contrôle ✅</p>
          </div>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="isModalOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl border border-white">
          <h3 class="text-2xl font-black text-[#1e293b] mb-2">Nouvelle Perte</h3>
          <p class="text-slate-400 text-sm mb-8 font-medium">Mise à jour de l'inventaire en direct.</p>
          
          <div class="space-y-6">
            <div>
              <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Sélectionner le bâtiment</label>
              <select v-model="selectedCampaign" class="w-full bg-slate-50 border-none rounded-2xl p-4 mt-2 outline-none focus:ring-2 focus:ring-slate-100 font-bold text-slate-700">
                <option value="" disabled>Choisir un lot...</option>
                <option v-for="c in allCampaigns" :key="c._id" :value="c._id">{{ c.name }}</option>
              </select>
            </div>
            
            <div>
              <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Nombre de têtes</label>
              <input v-model="lossQuantity" type="number" :max="allCampaigns.find(c => c._id === selectedCampaign)?.currentCount" min="1" class="w-full bg-slate-50 border-none rounded-2xl p-4 mt-2 outline-none focus:ring-2 focus:ring-slate-100 font-bold text-slate-700" />
            </div>
          </div>

          <div class="flex gap-4 mt-10">
            <button @click="isModalOpen = false" class="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors">Annuler</button>
            <button @click="submitLoss" class="flex-1 py-4 font-bold bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-100 active:scale-95">Confirmer</button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>
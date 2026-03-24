<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from "vue-router";

const router = useRouter();
const stats = ref([]);
const series = ref([{ name: 'Pertes', data: [] }]);
const topAlerts = ref([]); // 🔥 Initialisé vide, sera rempli par l'API
const isLoading = ref(true);

const fetchDashboardData = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:7000/api/campaigns/dashboard-stats", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    stats.value = res.data.stats || [];
    series.value[0].data = res.data.chartData || [];
    // 🛡️ Sécurité : si res.data.topAlerts n'existe pas, on met un tableau vide
    topAlerts.value = res.data.topAlerts || []; 
    
    isLoading.value = false;
  } catch (err) {
    console.error("Erreur lors de la récupération des stats:", err);
    isLoading.value = false;
  }
};
onMounted(fetchDashboardData);

// --- Logique d'authentification ---
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  router.push("/");
};


const currentDate = new Date().toLocaleDateString('fr-FR', { 
  weekday: 'long', 
  day: 'numeric', 
  month: 'long' 
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
  xaxis: { categories: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] },
  grid: { borderColor: '#f1f5f9' }
});
</script>

<template>
  <div v-if="isLoading" class="h-screen flex items-center justify-center bg-slate-50">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e293b]"></div>
  </div>

  <div v-else class="min-h-screen bg-slate-50 p-6 md:p-10 font-sans antialiased text-slate-900">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
      <div>
        <h2 class="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-1">Tableau de Bord</h2>
        <h1 class="text-4xl font-black text-[#1e293b] tracking-tight">Bonjour, Admin 👋</h1>
        <p class="text-slate-500 font-medium mt-1">{{ currentDate }} • <span class="text-[#F97316]">TerraCore Nord</span></p>
      </div>
      
      <button @click="logout" class="group flex items-center gap-3 bg-white border border-slate-200 text-slate-600 font-bold px-6 py-3 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all shadow-sm">
        <span>Déconnexion</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <div v-for="stat in stats" :key="stat.label" class="bg-white p-6 rounded-[2.5rem] shadow-xl border border-white">
        <p class="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-3">{{ stat.label }}</p>
        <div class="flex items-end justify-between">
          <span class="text-3xl font-[900] text-[#1e293b]">{{ stat.value }}</span>
          <span :class="stat.trendColor" class="text-[10px] font-black px-3 py-1 rounded-full bg-opacity-10">{{ stat.trend }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-xl border border-white">
        <h3 class="text-xl font-black text-[#1e293b] mb-8">Évolution de la mortalité</h3>
        <div class="h-72">
          <apexchart width="100%" height="100%" :options="chartOptions" :series="series"></apexchart>
        </div>
      </div>

      <div class="bg-white p-8 rounded-[3rem] shadow-xl border border-white">
        <h3 class="text-xl font-black text-[#1e293b] mb-8">Urgences</h3>
        <div class="space-y-4">
          <div v-for="alert in topAlerts" :key="alert.id" class="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem]">
            <div class="flex items-center gap-4">
              <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <p class="font-bold text-slate-800 text-sm">{{ alert.building }}</p>
            </div>
            <p class="text-red-600 font-black text-xl">{{ alert.rate }}%</p>
          </div>

          <div v-if="!topAlerts || topAlerts.length === 0" class="text-center py-10">
            <p class="text-slate-400 font-bold text-sm italic">Aucun incident critique</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Optionnel : Customization de la scrollbar pour main */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import CampaignStats from '../components/CampaignStats.vue';
import QuickActions from '../components/QuickActions.vue';
import CampaignCard from '../components/CampaignCard.vue';
import { LogOut } from 'lucide-vue-next';

const router = useRouter();
const user = JSON.parse(localStorage.getItem('user') || '{}');

// État
const campaigns = ref([]);
const stats = ref({
  totalCampaigns: 0,
  totalActive: 0,
  totalAnimals: 0,
  totalLosses: 0,
  mortalityRate: 0,
  monthlyGrowth: 5,
  totalRevenue: 0,
  revenueGrowth: 12
});

// Chargement des données
onMounted(async () => {
  try {
    const resCampaigns = await axios.get('http://localhost:7000/api/campaigns');
    campaigns.value = resCampaigns.data;
    
    // Calcul des stats
    computeStats();
  } catch (err) {
    console.error('Erreur chargement données:', err);
  }
});

const computeStats = () => {
  const total = campaigns.value.length;
  const active = campaigns.value.filter(c => c.status === 'active').length;
  const totalAnimals = campaigns.value.reduce((sum, c) => sum + (c.currentNumber || 0), 0);
  const totalLosses = campaigns.value.reduce((sum, c) => sum + (c.losses || 0), 0);
  
  stats.value = {
    totalCampaigns: total,
    totalActive: active,
    totalAnimals: totalAnimals,
    totalLosses: totalLosses,
    mortalityRate: totalAnimals > 0 ? (totalLosses / totalAnimals) * 100 : 0,
    monthlyGrowth: 5,
    totalRevenue: campaigns.value.reduce((sum, c) => sum + (c.revenue || 0), 0),
    revenueGrowth: 12
  };
};

// Gérer les actions rapides
const handleNewCampaign = () => router.push('/campaigns/new');
const handleAddAnimal = () => router.push('/campaigns');
const handleHealthCheck = () => router.push('/sante');
const handleAddTransaction = () => router.push('/finance');
const handleReportAlert = () => router.push('/alerts');
const handleViewStocks = () => router.push('/departements');
const handleGenerateReport = () => console.log('Rapport généré');
const handleSettings = () => console.log('Paramètres');

const handleViewCampaign = (campaign) => {
  router.push(`/campaigns/${campaign._id}`);
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/');
};

// Campagnes récentes
const recentCampaigns = computed(() => {
  return campaigns.value.slice(0, 4);
});
</script>

<template>
  <div class="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
    <!-- Header -->
    <div class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="min-w-0">
            <h1 class="heading-1 text-slate-800">
              Bienvenue, <span class="text-orange-600">{{ user.username || 'Utilisateur' }}</span>
            </h1>
            <p class="text-small text-slate-500 mt-2">
              Supervisez vos campagnes agricoles en temps réel
            </p>
          </div>
          <button 
            @click="logout"
            class="btn bg-red-600 hover:bg-red-700 text-white font-semibold self-start sm:self-auto"
          >
            <LogOut :size="18" />
            Déconnexion
          </button>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <main class="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <!-- Stats Dashboard -->
      <section class="mb-10">
        <h2 class="heading-2 text-slate-800 mb-6">Vue d'ensemble</h2>
        <CampaignStats :stats="stats" />
      </section>

      <!-- Actions Rapides -->
      <section class="mb-10">
        <QuickActions
          @new-campaign="handleNewCampaign"
          @add-animal="handleAddAnimal"
          @health-check="handleHealthCheck"
          @add-transaction="handleAddTransaction"
          @report-alert="handleReportAlert"
          @view-stocks="handleViewStocks"
          @generate-report="handleGenerateReport"
          @settings="handleSettings"
        />
      </section>

      <!-- Campagnes Récentes -->
      <section>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 class="heading-2 text-slate-800">Campagnes Actives</h2>
          <button
            @click="$router.push('/campaigns')"
            class="btn bg-orange-500 hover:bg-orange-600 text-white font-semibold self-start sm:self-auto"
          >
            Voir tout
          </button>
        </div>

        <div v-if="recentCampaigns.length === 0" class="card text-center py-12">
          <p class="text-slate-500 mb-4">Aucune campagne trouvée</p>
          <button
            @click="handleNewCampaign"
            class="btn bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          >
            Créer la première campagne
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CampaignCard
            v-for="campaign in recentCampaigns"
            :key="campaign._id"
            :campaign="campaign"
            @view="handleViewCampaign(campaign)"
          />
        </div>
      </section>

      <!-- Statistiques au bas -->
      <section class="mt-10 pt-8 border-t border-slate-200">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4">
            <p class="text-2xl font-black text-orange-600">{{ stats.totalCampaigns }}</p>
            <p class="text-small text-slate-500 mt-2">Campagnes</p>
          </div>
          <div class="text-center p-4">
            <p class="text-2xl font-black text-blue-600">{{ stats.totalActive }}</p>
            <p class="text-small text-slate-500 mt-2">En cours</p>
          </div>
          <div class="text-center p-4">
            <p class="text-2xl font-black text-green-600">{{ stats.totalAnimals }}</p>
            <p class="text-small text-slate-500 mt-2">Animaux</p>
          </div>
          <div class="text-center p-4">
            <p :class="['text-2xl font-black', stats.mortalityRate > 10 ? 'text-red-600' : 'text-orange-600']">
              {{ stats.mortalityRate.toFixed(1) }}%
            </p>
            <p class="text-small text-slate-500 mt-2">Mortalité</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1.5rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

@media (min-width: 768px) {
  .card {
    padding: 2rem;
    border-radius: 1.75rem;
  }
}

.card:hover {
  border-color: #f97316;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.1);
}
</style>
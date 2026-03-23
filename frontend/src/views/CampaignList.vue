<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { getCampaigns } from "../services/campaignService";

const campaigns = ref([]);
const loading = ref(true);
const router = useRouter();

// 🔥 Nouveaux états pour la recherche et le filtre
const searchQuery = ref("");
const statusFilter = ref("all");

const fetchCampaigns = async () => {
  try {
    const res = await getCampaigns();
    campaigns.value = res.data;
  } catch (err) {
    console.error("Erreur chargement campagnes", err);
  } finally {
    loading.value = false;
  }
};

// 🔥 Calcul des campagnes filtrées
const filteredCampaigns = computed(() => {
  return campaigns.value.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesStatus = statusFilter.value === "all" || campaign.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

onMounted(() => {
  fetchCampaigns();
});

const goToDetail = (id) => router.push(`/campaign/${id}`);
const goToCreate = () => router.push("/create");

const getProgress = (campaign) => {
  const total =
    campaign.initialCount ||
    campaign.currentCount + campaign.sold + (campaign.losses || 0);

  if (!total || total === 0) return 0;
  const percentage = (campaign.sold / total) * 100;
  return Math.min(Math.round(percentage), 100);
};
</script>

<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900">Campagnes</h1>
        <p class="text-gray-500 mt-1">
          Gerez et suivez l'évolution de vos lots d'élevage.
        </p>
      </div>

      <button
        @click="goToCreate"
        class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Nouvelle campagne
      </button>
    </div>

    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <div class="relative flex-1">
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Rechercher une campagne..." 
          class="w-full pl-4 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
        />
      </div>
      <select 
        v-model="statusFilter"
        class="px-4 py-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
      >
        <option value="all">Tous les statuts</option>
        <option value="active">En cours</option>
        <option value="completed">Terminée</option>
        <option value="preparation">Préparation</option>
      </select>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div
      v-else-if="campaigns.length === 0"
      class="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100"
    >
      <div class="text-gray-400 mb-4 text-5xl font-light">📦</div>
      <p class="text-gray-600 text-lg">
        Aucune campagne disponible pour le moment.
      </p>
    </div>

    <div
      v-else
      class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nom Campagne</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Progression (Ventes)</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Détails</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="campaign in filteredCampaigns"
              :key="campaign._id"
              class="hover:bg-blue-50/30 transition-colors group cursor-pointer"
              @click="goToDetail(campaign._id)"
            >
              <td class="px-6 py-5">
                <div class="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {{ campaign.name }}
                </div>
                <div class="text-xs text-gray-400">
                  ID: {{ campaign._id.slice(-6) }}
                </div>
              </td>

              <td class="px-6 py-5">
                <span
                  class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                  :class="{
                    'bg-yellow-100 text-yellow-700': campaign.status === 'preparation',
                    'bg-green-100 text-green-700': campaign.status === 'active',
                    'bg-gray-100 text-gray-600': campaign.status === 'completed',
                  }"
                >
                  {{ campaign.status === "active" ? "En cours" : campaign.status }}
                </span>
              </td>

              <td class="px-6 py-5 min-w-[200px]">
                <div class="flex items-center gap-3">
                  <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out"
                      :style="{ width: getProgress(campaign) + '%' }"
                    ></div>
                  </div>
                  <span class="text-sm font-bold text-gray-600 w-10 text-right">
                    {{ getProgress(campaign) }}%
                  </span>
                </div>
              </td>

              <td class="px-6 py-5">
                <div class="flex gap-4">
                  <div class="text-center">
                    <span class="block text-xs text-gray-400 uppercase">Vivant</span>
                    <span class="font-bold text-gray-700">{{ campaign.currentCount }}</span>
                  </div>
                  <div class="text-center border-l border-gray-100 pl-4">
                    <span class="block text-xs text-gray-400 uppercase">Morts</span>
                    <span class="font-bold text-red-500">{{ campaign.losses }}</span>
                  </div>
                </div>
              </td>

              <td class="px-6 py-5 text-right">
                <button class="text-gray-300 group-hover:text-blue-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="filteredCampaigns.length === 0 && !loading" class="p-10 text-center text-gray-400 italic">
        Aucune campagne ne correspond à votre recherche.
      </div>
    </div>
  </div>
</template>
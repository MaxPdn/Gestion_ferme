<template>
  <div class="p-4 md:p-8 font-serif bg-slate-50 min-h-screen">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
      <div>
        <h1 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight italic uppercase">Campagnes</h1>
        <p class="text-slate-500 mt-1 font-medium text-sm md:text-base">
          Gérez et suivez l'évolution de vos lots d'élevage.
        </p>
      </div>

      <button
        @click="goToCreate"
        class="w-full md:w-auto flex items-center justify-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white font-bold px-6 py-4 rounded-2xl shadow-lg shadow-slate-900/20 transition-all active:scale-95 border-b-4 border-slate-900"
      >
        <Plus :size="20" />
        Nouvelle campagne
      </button>
    </div>

    <!-- Filters Section -->
    <div class="flex flex-col md:flex-row gap-4 mb-8">
      <div class="relative flex-1 group">
        <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher une campagne..."
          class="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
        />
      </div>
      <div class="relative min-w-[200px]">
        <Filter :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <select
          v-model="statusFilter"
          class="w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 shadow-sm appearance-none cursor-pointer"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">En cours</option>
          <option value="completed">Terminée</option>
          <option value="preparation">Préparation</option>
        </select>
        <ChevronDown :size="18" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col justify-center items-center py-24 gap-4">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-b-orange-500"></div>
      <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Chargement des campagnes...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="campaigns.length === 0"
      class="bg-white rounded-[32px] p-16 text-center shadow-xl shadow-slate-200/50 border border-slate-100"
    >
      <div class="inline-flex bg-slate-50 p-6 rounded-3xl mb-6 text-slate-300">
        <Sprout :size="48" />
      </div>
      <h3 class="text-xl font-black text-slate-800 mb-2">Aucune campagne</h3>
      <p class="text-slate-500 font-medium">Commencez par créer votre première campagne d'élevage.</p>
    </div>

    <!-- Campaign Content -->
    <div v-else>
      <!-- Desktop Table View -->
      <div class="hidden md:block bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/50 border-b border-slate-100">
                <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom Campagne</th>
                <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Progression</th>
                <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bilan Sujets</th>
                <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr
                v-for="campaign in filteredCampaigns"
                :key="campaign._id"
                class="hover:bg-slate-50 transition-colors group cursor-pointer"
                @click="goToDetail(campaign._id)"
              >
                <td class="px-8 py-6">
                  <div class="font-black text-slate-800 text-lg leading-none mb-1">{{ campaign.name }}</div>
                  <div class="text-[10px] font-bold text-slate-300 uppercase tracking-wider">ID: {{ campaign._id.slice(-6) }}</div>
                </td>

                <td class="px-8 py-6">
                  <span
                    class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider inline-block"
                    :class="{
                      'bg-amber-100 text-amber-700': campaign.status === 'preparation',
                      'bg-green-100 text-green-700': campaign.status === 'active',
                      'bg-slate-100 text-slate-500': campaign.status === 'completed',
                    }"
                  >
                    {{ campaign.status === "active" ? "En cours" : campaign.status }}
                  </span>
                </td>

                <td class="px-8 py-6 min-w-[220px]">
                  <div class="flex items-center gap-4">
                    <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-slate-800 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                        :style="{ width: getProgress(campaign) + '%' }"
                      ></div>
                    </div>
                    <span class="text-xs font-black text-slate-800 w-8">{{ getProgress(campaign) }}%</span>
                  </div>
                </td>

                <td class="px-8 py-6">
                  <div class="flex gap-6 items-center">
                    <div>
                      <span class="block text-[10px] font-black text-slate-300 uppercase tracking-wider leading-none mb-1">Restants</span>
                      <span class="font-black text-slate-700">{{ campaign.currentCount }}</span>
                    </div>
                    <div class="w-px h-6 bg-slate-100"></div>
                    <div>
                      <span class="block text-[10px] font-black text-slate-300 uppercase tracking-wider leading-none mb-1">Pertes</span>
                      <span class="font-black text-red-500">{{ campaign.losses }}</span>
                    </div>
                  </div>
                </td>

                <td class="px-8 py-6 text-right" @click.stop>
                  <div class="flex justify-end items-center gap-2">
                    <button
                      @click="handleDelete(campaign._id, campaign.name)"
                      class="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 :size="18" />
                    </button>
                    <button @click="goToDetail(campaign._id)" class="p-2 text-slate-200 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all">
                      <ChevronRight :size="20" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Card View -->
      <div class="md:hidden space-y-4">
        <div 
          v-for="campaign in filteredCampaigns" 
          :key="campaign._id"
          class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm active:scale-[0.98] transition-all"
          @click="goToDetail(campaign._id)"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="font-black text-slate-800 text-lg leading-tight">{{ campaign.name }}</h3>
              <p class="text-[10px] font-bold text-slate-300 uppercase mt-0.5">ID: {{ campaign._id.slice(-6) }}</p>
            </div>
            <span
              class="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider"
              :class="{
                'bg-amber-100 text-amber-700': campaign.status === 'preparation',
                'bg-green-100 text-green-700': campaign.status === 'active',
                'bg-slate-100 text-slate-500': campaign.status === 'completed',
              }"
            >
              {{ campaign.status === "active" ? "En cours" : campaign.status }}
            </span>
          </div>

          <div class="space-y-4">
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progression des ventes</span>
                <span class="text-[10px] font-black text-slate-800">{{ getProgress(campaign) }}%</span>
              </div>
              <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-slate-800 rounded-full transition-all duration-1000"
                  :style="{ width: getProgress(campaign) + '%' }"
                ></div>
              </div>
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <div class="text-center flex-1">
                <span class="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Restants</span>
                <span class="font-black text-slate-700">{{ campaign.currentCount }}</span>
              </div>
              <div class="w-px h-6 bg-slate-200 mx-2"></div>
              <div class="text-center flex-1">
                <span class="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pertes</span>
                <span class="font-black text-red-500">{{ campaign.losses }}</span>
              </div>
            </div>

            <div class="flex gap-2 pt-2">
              <button 
                @click.stop="goToDetail(campaign._id)"
                class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition-colors"
              >
                Gérer
              </button>
              <button 
                @click.stop="handleDelete(campaign._id, campaign.name)"
                class="px-4 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors"
              >
                <Trash2 :size="18" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Filter State -->
      <div
        v-if="filteredCampaigns.length === 0 && !loading"
        class="p-16 text-center"
      >
        <div class="text-slate-200 mb-4 flex justify-center"><Search :size="48" /></div>
        <p class="text-slate-400 font-bold italic">Aucune campagne ne correspond à votre recherche.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { getCampaigns, deleteCampaign } from "../services/campaignService";
import Swal from 'sweetalert2';
import { Plus, Search, Filter, ChevronDown, Trash2, ChevronRight, Sprout } from 'lucide-vue-next';

const campaigns = ref([]);
const loading = ref(true);
const router = useRouter();

// Nouveaux états pour la recherche et le filtre
const searchQuery = ref("");
const statusFilter = ref("all");

const fetchCampaigns = async () => {
  try {
    const res = await getCampaigns();
    campaigns.value = res.data;
    // console.log(campaigns.value);
    
  } catch (err) {
    console.error("Erreur chargement campagnes", err);
  } finally {
    loading.value = false;
  }
};

// Calcul des campagnes filtrées
const filteredCampaigns = computed(() => {
  return campaigns.value.filter((campaign) => {
    const matchesSearch = campaign.name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    const matchesStatus =
      statusFilter.value === "all" || campaign.status === statusFilter.value;
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

const handleDelete = async (id, name) => {
  const result = await Swal.fire({
    title: 'Êtes-vous sûr ?',
    text: `La campagne "${name}" sera définitivement supprimée.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#1e293b',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: 'Oui, supprimer',
    cancelButtonText: 'Annuler',
    reverseButtons: true,
    customClass: {
      popup: 'rounded-[32px]',
      confirmButton: 'rounded-xl px-6 py-3 font-bold',
      cancelButton: 'rounded-xl px-6 py-3 font-bold'
    }
  });

  if (result.isConfirmed) {
    try {
      await deleteCampaign(id);
      campaigns.value = campaigns.value.filter(c => c._id !== id);
      Swal.fire({
        title: 'Supprimé !',
        text: 'La campagne a été retirée avec succès.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: 'rounded-[32px]' }
      });
    } catch (err) {
      console.error("Erreur suppression", err);
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de supprimer la campagne.',
        icon: 'error',
        customClass: { popup: 'rounded-[32px]' }
      });
    }
  }
};
</script>

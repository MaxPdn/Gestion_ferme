<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getCampaign,
  addLoss,
  addSale,
  updateStatus,
} from "../services/campaignService";

const route = useRoute();
const router = useRouter();
const campaign = ref(null);
const loading = ref(true);

const lossInput = ref(0);
const saleInput = ref(0);

const fetchCampaign = async () => {
  try {
    const res = await getCampaign(route.params.id);
    campaign.value = res.data;
    console.log(res.data);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCampaign);

const handleAddLoss = async () => {
  if (lossInput.value <= 0) return;
  await addLoss(campaign.value._id, Number(lossInput.value));
  lossInput.value = 0;
  await fetchCampaign();
};

const handleAddSale = async () => {
  if (saleInput.value <= 0) return;
  await addSale(campaign.value._id, Number(saleInput.value));
  saleInput.value = 0;
  await fetchCampaign();
};

const handleStatusChange = async (status) => {
  await updateStatus(campaign.value._id, status);
  await fetchCampaign();
};
</script>

<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    <div class="flex items-center gap-4 mb-8">
      <button @click="router.back()" class="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900" v-if="campaign">{{ campaign.name }}</h1>
        <p class="text-gray-500 text-sm">Gestion détaillée de la campagne</p>
      </div>
    </div>

    <div v-if="!loading && campaign" class="space-y-6">
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-blue-500 flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-gray-400 uppercase tracking-wider">Effectif Actuel</p>
            <p class="text-3xl font-black text-gray-800">{{ campaign.currentCount }}</p>
          </div>
          <div class="p-3 bg-blue-50 rounded-2xl text-blue-500 text-2xl">🐖</div>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-red-500 flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-gray-400 uppercase tracking-wider">Pertes totales</p>
            <p class="text-3xl font-black text-red-600">{{ campaign.losses }}</p>
          </div>
          <div class="p-3 bg-red-50 rounded-2xl text-red-500 text-2xl">⚠️</div>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-green-500 flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-gray-400 uppercase tracking-wider">Animaux Vendus</p>
            <p class="text-3xl font-black text-green-600">{{ campaign.sold }}</p>
          </div>
          <div class="p-3 bg-green-50 rounded-2xl text-green-500 text-2xl">🛒</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Informations
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between py-2 border-b border-gray-50">
              <span class="text-gray-500 text-sm">Département</span>
              <span class="font-bold text-gray-700">{{ campaign.department?.name || "N/A" }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-50">
              <span class="text-gray-500 text-sm">Objectif</span>
              <span class="font-bold text-gray-700">{{ campaign.objective || "Non défini" }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-gray-500 text-sm">Statut actuel</span>
              <span class="px-2 py-0.5 rounded-lg text-xs font-bold uppercase" 
                :class="campaign.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                {{ campaign.status }}
              </span>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 grid md:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 class="font-bold text-gray-800 mb-4">Signaler des Pertes</h3>
            <div class="flex gap-2">
              <input v-model="lossInput" type="number" class="flex-1 border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:outline-none transition-all" placeholder="Ex: 2" />
              <button @click="handleAddLoss" class="bg-red-500 hover:bg-red-600 text-white font-bold px-6 rounded-xl transition-colors">Valider</button>
            </div>
          </div>

          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 class="font-bold text-gray-800 mb-4">Enregistrer des Ventes</h3>
            <div class="flex gap-2">
              <input v-model="saleInput" type="number" class="flex-1 border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all" placeholder="Ex: 5" />
              <button @click="handleAddSale" class="bg-green-600 hover:bg-green-700 text-white font-bold px-6 rounded-xl transition-colors">Valider</button>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 class="font-bold text-gray-800 mb-4">Cycle de vie de la campagne</h3>
        <div class="flex flex-wrap gap-4">
          <button @click="handleStatusChange('preparation')" 
            class="flex-1 min-w-[140px] px-6 py-4 rounded-2xl font-bold transition-all border-2"
            :class="campaign.status === 'preparation' ? 'bg-yellow-50 border-yellow-500 text-yellow-700' : 'border-gray-100 text-gray-400 hover:border-yellow-200'">
            🛠️ Préparation
          </button>
          <button @click="handleStatusChange('active')" 
            class="flex-1 min-w-[140px] px-6 py-4 rounded-2xl font-bold transition-all border-2"
            :class="campaign.status === 'active' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-100 text-gray-400 hover:border-green-200'">
            🚀 En cours
          </button>
          <button @click="handleStatusChange('completed')" 
            class="flex-1 min-w-[140px] px-6 py-4 rounded-2xl font-bold transition-all border-2"
            :class="campaign.status === 'completed' ? 'bg-gray-100 border-gray-500 text-gray-700' : 'border-gray-100 text-gray-400 hover:border-gray-300'">
            ✅ Terminé
          </button>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-24 space-y-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="text-gray-400 font-medium tracking-widest uppercase text-xs">Synchronisation des données...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  getCampaign,
  addLoss,
  addSale,
  updateStatus,
} from "../services/campaignService";

const route = useRoute();
const campaign = ref(null);
const loading = ref(true);

// inputs rapides
const lossInput = ref(0);
const saleInput = ref(0);

// 🔄 charger campagne
const fetchCampaign = async () => {
  try {
    const res = await getCampaign(route.params.id);
    campaign.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCampaign);

// 🔴 ajouter pertes
const handleAddLoss = async () => {
  if (!lossInput.value) return;

  await addLoss(campaign.value._id, Number(lossInput.value));
  lossInput.value = 0;
  fetchCampaign(); // refresh
};

// 🟢 ajouter ventes
const handleAddSale = async () => {
  if (!saleInput.value) return;

  await addSale(campaign.value._id, Number(saleInput.value));
  saleInput.value = 0;
  fetchCampaign();
};

// 🔵 changer statut
const handleStatusChange = async (status) => {
  await updateStatus(campaign.value._id, status);
  fetchCampaign();
};
</script>

<template>
  <div class="p-6" v-if="!loading && campaign">
    <!-- HEADER -->
    <h1 class="text-2xl font-bold mb-4">
      {{ campaign.name }}
    </h1>

    <!-- INFOS -->
    <div class="bg-white p-4 rounded-2xl shadow mb-6">
      <p><strong>Département :</strong> {{ campaign.department?.name || "N/A" }}</p>
      <p><strong>Statut :</strong> {{ campaign.status }}</p>
      <p><strong>Objectif :</strong> {{ campaign.objective }}</p>
    </div>

    <!-- STATS -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-gray-100 p-4 rounded-xl text-center">
        <p class="text-sm text-gray-500">Effectif</p>
        <p class="text-xl font-bold">{{ campaign.currentCount }}</p>
      </div>

      <div class="bg-red-100 p-4 rounded-xl text-center">
        <p class="text-sm text-red-500">Pertes</p>
        <p class="text-xl font-bold">{{ campaign.losses }}</p>
      </div>

      <div class="bg-blue-100 p-4 rounded-xl text-center">
        <p class="text-sm text-blue-500">Ventes</p>
        <p class="text-xl font-bold">{{ campaign.sold }}</p>
      </div>
    </div>

    <!-- ACTIONS RAPIDES -->
    <div class="grid md:grid-cols-2 gap-6 mb-6">
      
      <!-- 🔴 pertes -->
      <div class="bg-white p-4 rounded-2xl shadow">
        <h3 class="font-semibold mb-2">Ajouter pertes</h3>
        <div class="flex gap-2">
          <input
            v-model="lossInput"
            type="number"
            placeholder="Quantité"
            class="border p-2 rounded w-full"
          />
          <button
            @click="handleAddLoss"
            class="bg-red-500 text-white px-4 rounded"
          >
            OK
          </button>
        </div>
      </div>

      <!-- 🟢 ventes -->
      <div class="bg-white p-4 rounded-2xl shadow">
        <h3 class="font-semibold mb-2">Ajouter ventes</h3>
        <div class="flex gap-2">
          <input
            v-model="saleInput"
            type="number"
            placeholder="Quantité"
            class="border p-2 rounded w-full"
          />
          <button
            @click="handleAddSale"
            class="bg-green-600 text-white px-4 rounded"
          >
            OK
          </button>
        </div>
      </div>
    </div>

    <!-- STATUT -->
    <div class="bg-white p-4 rounded-2xl shadow">
      <h3 class="font-semibold mb-3">Changer statut</h3>

      <div class="flex gap-3">
        <button
          @click="handleStatusChange('preparation')"
          class="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Préparation
        </button>

        <button
          @click="handleStatusChange('active')"
          class="px-4 py-2 bg-green-600 text-white rounded"
        >
          En cours
        </button>

        <button
          @click="handleStatusChange('completed')"
          class="px-4 py-2 bg-gray-600 text-white rounded"
        >
          Terminé
        </button>
      </div>
    </div>
  </div>

  <!-- LOADING -->
  <div v-else class="p-6 text-gray-500">
    Chargement...
  </div>
</template>
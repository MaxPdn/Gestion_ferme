<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import {
  getAnimal,
  getStats,
  getAnomaly,
  getQRCode
} from "@/services/animalService";
import { addWeight as addWeightAPI } from "@/services/animalService";
import { addHealth as addHealthAPI } from "@/services/animalService";
import AnimalHeader from "@/components/animal-component/AnimalHeader.vue";
import AnimalActions from "@/components/animal-component/AnimalActions.vue";
import AnimalStatsCard from "@/components/animal-component/AnimalStatsCard.vue";
import AnimalWeightChart from "@/components/animal-component/AnimalWeightChart.vue";
import AnimalAnomalyCard from "@/components/animal-component/AnimalAnomalyCard.vue";
import AnimalWeightSection from "@/components/animal-component/AnimalWeightSection.vue";
import AnimalHealthSection from "@/components/animal-component/AnimalHealthSection.vue";
import AnimalQRCodeCard from "@/components/animal-component/AnimalQRCodeCard.vue";
import AnimalMetaCard from "@/components/animal-component/AnimalMetaCard.vue";
import AddWeightModal from "@/components/animal-component/form/AddWeightModal.vue";
import AddHealthModal from "@/components/animal-component/form/AddHealthModal.vue";


const router = useRouter();
const route = useRoute();
const id = route.params.id;

const animal = ref(null);
const stats = ref(null);
const anomaly = ref(null);
const qr = ref(null);

const loading = ref(true);
const error = ref(false);

const showWeightModal = ref(false);
const showHealthModal = ref(false);

const addWeight = () => {
  showWeightModal.value = true;
};

const addHealth = () => {
  showHealthModal.value = true;
};


const handleSaveWeight = async (value) => {

  const oldWeights = [...animal.value.weights];

  animal.value.weights.push({
    value,
    date: new Date()
  });

  try {
    await addWeightAPI(id, value);
  } catch (err) {
    animal.value.weights = oldWeights;
    console.error(err);
  }

  showWeightModal.value = false;
};


const handleSaveHealth = async (data) => {

  const oldHistory = [...animal.value.healthHistory];

  animal.value.healthHistory.push({
    ...data,
    date: new Date()
  });

  try {
    await addHealthAPI(id, data);
  } catch (err) {
    animal.value.healthHistory = oldHistory;
    console.error(err);
  }

  showHealthModal.value = false;
};


onMounted(async () => {
  try {
    animal.value = await getAnimal(id);
    if (!animal.value) throw new Error("Animal not found");

    // parallèle = plus rapide
    const [statsData, anomalyData, qrData] = await Promise.all([
      getStats(id),
      getAnomaly(id),
      getQRCode(id)
    ]);

    stats.value = statsData;
    anomaly.value = anomalyData;
    qr.value = qrData;

  } catch (err) {
    console.error(err);
    error.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
<div class="p-8 bg-gray-50 min-h-screen text-gray-900">

  <!-- LOADING -->
  <div v-if="loading" class="flex items-center justify-center h-[60vh]">
    <p class="text-gray-400 animate-pulse">Chargement...</p>
  </div>

  <!-- ERROR -->
  <div v-else-if="error" class="flex flex-col items-center justify-center h-[60vh]">
    <p class="text-red-500 font-semibold">Erreur de chargement</p>
    <p class="text-gray-400 text-sm">Vérifie l'ID ou le serveur</p>
  </div>

  <!-- CONTENT -->
  <div v-else>

    <!-- BACK -->
    <div class="mb-6">
      <button 
        @click="router.back()" 
        class="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition px-3 py-2 rounded-lg hover:bg-gray-100"
      >
        ← Retour
      </button>
    </div>

    <!-- HEADER -->
    <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <AnimalHeader :animal="animal" />
      <AnimalActions @addWeight="addWeight" @addHealth="addHealth" />
    </div>

    <!-- GRID -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

      <!-- LEFT -->
      <div class="space-y-6 lg:col-span-2">

        <AnimalStatsCard v-if="stats" :stats="stats" />

        <AnimalWeightChart
          v-if="animal?.weights?.length"
          :weights="animal.weights"
        />

        <AnimalAnomalyCard
          v-if="anomaly"
          :anomaly="anomaly"
        />

        <AnimalWeightSection
          v-if="animal?.weights"
          :weights="animal.weights"
        />

        <AnimalHealthSection
          v-if="animal?.healthHistory"
          :history="animal.healthHistory"
        />

      </div>

      <!-- RIGHT -->
      <div class="space-y-6">

        <AnimalQRCodeCard
          v-if="qr"
          :qr="qr"
        />

        <AnimalMetaCard
          v-if="animal"
          :animal="animal"
        />

      </div>

    </div>

  </div>

  <!-- MODALS -->
  <AddWeightModal
    v-if="showWeightModal"
    @close="showWeightModal = false"
    @save="handleSaveWeight"
  />

  <AddHealthModal
    v-if="showHealthModal"
    @close="showHealthModal = false"
    @save="handleSaveHealth"
  />

</div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getCampaigns } from "../services/campaignService";

// 📦 état local
const campaigns = ref([]);
const loading = ref(true);

const router = useRouter();

// 🔄 récupérer les campagnes
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

// 🚀 au chargement
onMounted(() => {
  fetchCampaigns();
});

// 🔁 navigation vers détail
const goToDetail = (id) => {
  router.push(`/campaign/${id}`);
};

// ➕ aller vers création
const goToCreate = () => {
  router.push("/create");
};
</script>

<template>
  <div class="p-6">
    <!-- HEADER -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Campagnes</h1>

      <button
        @click="goToCreate"
        class="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
      >
        + Nouvelle campagne
      </button>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="text-gray-500">
      Chargement...
    </div>

    <!-- LISTE VIDE -->
    <div v-else-if="campaigns.length === 0" class="text-gray-500">
      Aucune campagne disponible
    </div>

    <!-- LISTE -->
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="campaign in campaigns"
        :key="campaign._id"
        @click="goToDetail(campaign._id)"
        class="cursor-pointer bg-white p-4 rounded-2xl shadow hover:shadow-lg transition"
      >
        <!-- NOM -->
        <h2 class="text-lg font-semibold mb-2">
          {{ campaign.name }}
        </h2>

        <!-- STATUT -->
        <p class="text-sm mb-1">
          Statut :
          <span
            :class="{
              'text-yellow-500': campaign.status === 'preparation',
              'text-green-600': campaign.status === 'active',
              'text-gray-500': campaign.status === 'completed',
            }"
          >
            {{ campaign.status }}
          </span>
        </p>

        <!-- EFFECTIF -->
        <p class="text-sm">
          Effectif : {{ campaign.currentCount }}
        </p>

        <!-- PERTES -->
        <p class="text-sm text-red-500">
          Pertes : {{ campaign.losses }}
        </p>

        <!-- VENTES -->
        <p class="text-sm text-blue-500">
          Ventes : {{ campaign.sold }}
        </p>
      </div>
    </div>
  </div>
</template>
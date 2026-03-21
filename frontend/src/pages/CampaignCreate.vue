<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { createCampaign } from "../services/campaignService";

const router = useRouter();

// 📦 état formulaire
const form = ref({
  name: "",
  department: "volaille",
  startDate: "",
  objective: "",
  initialCount: "",
  budget: "",
});

const loading = ref(false);
const error = ref("");

// 🚀 soumission
const handleSubmit = async () => {
  error.value = "";

  // validation simple
  if (
    !form.value.name ||
    !form.value.startDate ||
    !form.value.objective ||
    !form.value.initialCount
  ) {
    error.value = "Veuillez remplir les champs obligatoires";
    return;
  }

  try {
    loading.value = true;

    await createCampaign({
      ...form.value,
      objective: Number(form.value.objective),
      initialCount: Number(form.value.initialCount),
      budget: Number(form.value.budget || 0),
    });

    // redirection vers liste
    router.push("/");
  } catch (err) {
    error.value = "Erreur lors de la création";
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="p-6 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">
      Nouvelle campagne
    </h1>

    <!-- ERREUR -->
    <div v-if="error" class="bg-red-100 text-red-600 p-3 rounded mb-4">
      {{ error }}
    </div>

    <div class="space-y-4">
      <!-- NOM -->
      <input
        v-model="form.name"
        type="text"
        placeholder="Nom de la campagne"
        class="w-full border p-3 rounded-xl"
      />

      <!-- DEPARTEMENT -->
      <select
        v-model="form.department"
        class="w-full border p-3 rounded-xl"
      >
        <option value="volaille">Volaille</option>
        <option value="betail">Bétail</option>
        <option value="pisciculture">Pisciculture</option>
      </select>

      <!-- DATE -->
      <input
        v-model="form.startDate"
        type="date"
        class="w-full border p-3 rounded-xl"
      />

      <!-- OBJECTIF -->
      <input
        v-model="form.objective"
        type="number"
        placeholder="Objectif (ex: 500)"
        class="w-full border p-3 rounded-xl"
      />

      <!-- EFFECTIF INITIAL -->
      <input
        v-model="form.initialCount"
        type="number"
        placeholder="Effectif initial"
        class="w-full border p-3 rounded-xl"
      />

      <!-- BUDGET -->
      <input
        v-model="form.budget"
        type="number"
        placeholder="Budget (optionnel)"
        class="w-full border p-3 rounded-xl"
      />

      <!-- BOUTON -->
      <button
        @click="handleSubmit"
        :disabled="loading"
        class="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700"
      >
        {{ loading ? "Création..." : "Créer la campagne" }}
      </button>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { createCampaign } from "../services/campaignService";
import { getDepartments } from "../services/departmentService";

const router = useRouter();

// 📦 formulaire de création
const form = ref({
  name: "",
  department: "",
  startDate: "",
  objective: "",
  initialCount: "",
  budget: "",
});

// 🔥 départements dynamiques
const departments = ref([]);
const loading = ref(false);
const error = ref("");

// 📥 fetch departments
const fetchDepartments = async () => {
  try {
    const res = await getDepartments();
    departments.value = res.data;

    // auto sélection du premier
    if (res.data.length > 0) {
      form.value.department = res.data[0]._id;
    }
  } catch (err) {
    console.error("Erreur chargement départements", err);
    error.value = "Impossible de charger les départements";
  }
};

onMounted(fetchDepartments);

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
    error.value = "Veuillez remplir tous les champs obligatoires";
    return;
  }

  if (!form.value.department) {
    error.value = "Veuillez choisir un département";
    return;
  }

  try {
    loading.value = true;

    await createCampaign({
      ...form.value,
      startDate: new Date(form.value.startDate), // 🔥 FIX
      objective: Number(form.value.objective),
      initialCount: Number(form.value.initialCount),
      budget: Number(form.value.budget || 0),
    });

    // redirection vers liste
    router.push("/campagnes");
  } catch (err) {
    console.log("ERREUR BACK:", err.response?.data); // 🔥

    error.value =
      err.response?.data?.message ||
      "Erreur lors de la création de la campagne";
  } finally {
    loading.value = false;
  }
  console.log("DATA ENVOYÉE :", form.value);
};

</script>

<template>
  <div class="p-6 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Nouvelle campagne</h1>

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
      <select v-model="form.department" class="w-full border p-3 rounded-xl">
        <option disabled value="">Choisir un département</option>
        <option v-for="dept in departments" :key="dept._id" :value="dept._id">
          {{ dept.name }}
        </option>
      </select>
      <p v-if="departments.length === 0" class="text-red-500 text-sm">
        Aucun département disponible. Veuillez créer un département dans la
        rubrique Départements.
      </p>

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
        :disabled="loading || !form.department"
        class="w-full bg-green-600 text-white p-3 rounded-xl disabled:opacity-50"
      >
        {{ loading ? "Création..." : "Créer la campagne" }}
      </button>
    </div>
  </div>
</template>

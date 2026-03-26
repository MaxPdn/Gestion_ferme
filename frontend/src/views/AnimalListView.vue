<script setup>
import { computed, onMounted, ref } from "vue";
import { getAnimals, createAnimal, deleteAnimal } from "@/services/animalService";
import { useRouter } from "vue-router";
import AddAnimalModal from "@/components/animal-component/form/AddAnimalModal.vue";
import { useAutoRefresh } from "../composables/useAutoRefresh";

const { triggerRefresh, onRefresh } = useAutoRefresh();


const router = useRouter()
const animals = ref([]);
const loading = ref(true);
const error = ref(false);
const showModal = ref(false);

const handleCreateAnimal = async (data) => {
  try {
    const response = await createAnimal(data);
    const newAnimal = response.data || response;

    animals.value.unshift(newAnimal);
    triggerRefresh();

    showModal.value = false;

    router.push(`/animal/${newAnimal._id}`);
    
  } catch (err) {
    console.error(err);
  }
};


const handleDelete = async (id) => {
  const confirmDelete = confirm("Supprimer cet animal ?");

  if (!confirmDelete) return;

  const oldAnimals = [...animals.value];

  animals.value = animals.value.filter(a => a._id !== id);

  try {
    await deleteAnimal(id);
    triggerRefresh();
  } catch (err) {
    console.error(err);

    // rollback si erreur
    animals.value = oldAnimals;
  }
};

const refreshAnimals = async () => {
  loading.value = true;
  try {
    animals.value = await getAnimals();
  } catch (err) {
    console.error(err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(refreshAnimals);
onRefresh(refreshAnimals);

const currentPage = ref(1);
const itemsPerPage = 4;

const totalPages = computed(() =>
  Math.ceil(animals.value.length / itemsPerPage)
);

const paginatedAnimals = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return animals.value.slice(start, start + itemsPerPage);
});

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};
</script>

<template>
<div class="p-8 bg-gray-50 min-h-screen text-gray-900">

  <!-- HEADER -->
  <div class="flex justify-between items-center mb-8">
    <div>
      <h1 class="text-2xl font-bold">Suivi Individuel</h1>
      <p class="text-gray-500 text-sm">
        Gestion et suivi des animaux
      </p>
    </div>

    <button
      @click="showModal = true"
      class="bg-orange-500 cursor-pointer hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl shadow-sm transition font-medium"
    >
      + Ajouter un animal
    </button>
  </div>

  <!-- LOADING -->
  <div v-if="loading" class="text-center text-gray-400 py-20 animate-pulse">
    Chargement...
  </div>

  <!-- ERROR -->
  <div v-else-if="error" class="text-center text-red-500 py-20">
    Erreur lors du chargement
  </div>

  <!-- TABLE -->
  <div v-else class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

    <!-- HEADER -->
    <div class="grid grid-cols-5 px-6 py-4 bg-gray-100 text-sm text-gray-600 font-semibold">
      <span>Code</span>
      <span>Département</span>
      <span>Statut</span>
      <span>Campagne</span>
      <span class="text-right">Action</span>
    </div>

    <!-- ROWS -->
    <div
      v-for="animal in paginatedAnimals"
      :key="animal._id"
      class="grid grid-cols-5 px-6 py-4 border-t border-gray-100 items-center hover:bg-gray-50 transition"
    >
      <span class="font-medium">
        {{ animal.code }}
      </span>

      <span class="text-gray-500">
        {{ animal.campaign?.department?.name.toUpperCase() || "Pas de Departement" }}
      </span>

      <!-- STATUS -->
      <span>
        <span
          class="px-3 py-1 text-xs rounded-full font-medium"
          :class="{
            'bg-green-100 text-green-600': animal.status === 'vivant',
            'bg-red-100 text-red-600': animal.status === 'mort',
            'bg-yellow-100 text-yellow-600': animal.status === 'vendu'
          }"
        >
          {{ animal.status }}
        </span>
      </span>

      <span class="text-gray-500">
        {{ animal.campaign?.name || "Pas de Campagne" }}
      </span>

      <div class="flex justify-end gap-3">
        <!-- VOIR -->
        <button
          class="text-orange-500 cursor-pointer hover:text-orange-600 font-medium text-sm"
          @click="router.push(`/animal/${animal._id}`)"
        >
          Voir →
        </button>
          <!-- DELETE -->
  <button
    @click="handleDelete(animal._id)"
    class="text-red-500 cursor-pointer hover:text-red-600 text-sm"
  >
    Supprimer
  </button>
      </div>
    </div>
  </div>

  <!-- PAGINATION -->
  <div class="flex justify-center items-center gap-2 mt-8">

    <button
      @click="goToPage(currentPage - 1)"
      class="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100"
    >
      ←
    </button>

    <button
      v-for="page in totalPages"
      :key="page"
      @click="goToPage(page)"
      class="px-3 py-1 rounded border"
      :class="page === currentPage
        ? 'bg-orange-500 text-white border-orange-500'
        : 'bg-white border-gray-200 hover:bg-gray-100'"
    >
      {{ page }}
    </button>

    <button
      @click="goToPage(currentPage + 1)"
      class="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100"
    >
      →
    </button>

  </div>

  <!-- MODAL -->
  <AddAnimalModal
    v-if="showModal"
    @close="showModal = false"
    @created="handleCreateAnimal"
  />

</div>
</template>
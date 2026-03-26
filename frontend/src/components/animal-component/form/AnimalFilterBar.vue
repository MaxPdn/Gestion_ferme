<script setup>
import { ref, watch } from "vue";

const emit = defineEmits(["update"]);

const search = ref("");
const status = ref("");
const species = ref("");

watch([search, status, species], () => {
  emit("update", {
    search: search.value,
    status: status.value,
    species: species.value
  });
});
</script>

<template>
  <div class="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-3">

    <!-- SEARCH -->
    <input
      v-model="search"
      type="text"
      placeholder="Rechercher un animal..."
      class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
    />

    <!-- STATUS -->
    <select
      v-model="status"
      class="px-3 py-2 border rounded-lg"
    >
      <option value="">Tous statuts</option>
      <option value="vivant">Vivant</option>
      <option value="mort">Mort</option>
      <option value="vendu">Vendu</option>
    </select>

    <!-- SPECIES -->
    <select
      v-model="species"
      class="px-3 py-2 border rounded-lg"
    >
      <option value="">Toutes espèces</option>
      <option value="volaille">Volaille</option>
      <option value="betail">Bétail</option>
      <option value="poisson">Poisson</option>
    </select>

  </div>
</template>
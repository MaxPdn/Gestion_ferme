<script setup>
defineProps({ stats: Object });
</script>

<template>
<div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
    
  <h3 class="font-semibold text-lg mb-4 text-gray-900">
    Statistiques
  </h3>

  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">

    <div class="bg-gray-50 p-4 rounded-xl text-center hover:shadow-sm transition">
      <p class="text-gray-500 text-sm">Poids Actuel</p>
      <h4 class="font-bold mt-2 text-lg text-gray-900">
        {{ stats.currentWeight }} kg
      </h4>
    </div>

    <div class="bg-gray-50 p-4 rounded-xl text-center hover:shadow-sm transition">
      <p class="text-gray-500 text-sm">Poids Moyen</p>
      <h4 class="font-bold mt-2 text-lg text-gray-900">
        {{ stats.averageWeight.toFixed(2) }} kg
      </h4>
    </div>

    <div class="bg-gray-50 p-4 rounded-xl text-center hover:shadow-sm transition">
      <p class="text-gray-500 text-sm">Croissance</p>
      <h4 class="font-bold mt-2 text-lg text-gray-900">
        {{ stats.growth?.toFixed(2) ?? 0 }}
      </h4>
    </div>

    <div class="bg-gray-50 p-4 rounded-xl text-center hover:shadow-sm transition">
      <p class="text-gray-500 text-sm">% Croissance</p>
      <h4 class="font-bold mt-2 text-lg text-gray-900">
        {{ stats.growthRate?.toFixed(1) ?? 0 }}%
      </h4>
    </div>

  </div>

</div>
</template>
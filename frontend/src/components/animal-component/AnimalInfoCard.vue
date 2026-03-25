<script setup>
defineProps({ animal: Object });


</script>

<template>
  <div class="bg-slate-800 p-5 rounded-2xl border border-slate-700">
    <h2 class="text-xl font-bold">{{ animal.code }}</h2>

    <div class="grid grid-cols-2 gap-4 mt-4 text-sm">

      <p>
        <span class="text-slate-400">Espèce :</span>
        {{ animal.species }}
      </p>

      <p>
        <span class="text-slate-400">Statut :</span>
        {{ animal.status }}
      </p>

      <p>
        <span class="text-slate-400">Naissance :</span>
        {{ animal.birthDate }}
      </p>

      <p>
        <span class="text-slate-400">ID :</span>
        {{ animal._id }}
      </p>

    </div>
  </div>
</template>
<script setup>
import AnimalStatusBadge from './AnimalStatusBadge.vue';


defineProps({ animal: Object });

const getAgeLabel = (date) => {
  if (!date) return "";

  const now = new Date();
  const birth = new Date(date);

  const diffMs = now - birth;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days === 0) return "Né aujourd’hui";
  if (days === 1) return "Né hier";

  if (days < 30) return `Né il y a ${days} jours`;

  const months = Math.floor(days / 30);
  if (months < 12) {
    return months === 1
      ? "Né il y a 1 mois"
      : `Né il y a ${months} mois`;
  }

  const years = Math.floor(months / 12);
  return years === 1
    ? "Né il y a 1 an"
    : `Né il y a ${years} ans`;
};

</script>

<template>
<div class="flex justify-between items-center">
  <div>
    <h1 class="text-2xl font-bold flex items-center gap-3 text-gray-900">
      {{ animal.code }}
      <AnimalStatusBadge :status="animal.status" />
    </h1>

<p class="text-gray-500 text-sm">
  {{ animal.campaign?.department?.name.toUpperCase() || "Pas de Departement" }} • {{ getAgeLabel(animal.birthDate) }}
</p>
  </div>
</div>
</template>
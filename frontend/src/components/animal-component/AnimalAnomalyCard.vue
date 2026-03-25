<script setup>
import { computed } from "vue";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-vue-next";

const props = defineProps({ anomaly: Object });

const config = computed(() => {
  const level = props.anomaly?.level;

  switch (level) {
    case "critical":
      return {
        color: "border-red-200 bg-red-50 text-red-600",
        icon: AlertCircle,
        title: "Problème détecté",
      };

    case "warning":
      return {
        color:  "border-yellow-200 bg-yellow-50 text-yellow-600",
        icon: AlertTriangle,
        title: "Attention",
      };

    case "normal":
      return {
        color: "border-green-200 bg-green-50 text-green-600",
        icon: CheckCircle,
        title: "Tout est normal",
      };

    default:
      return {
        color: "border-gray-200 bg-gray-50 text-gray-500",
        icon: AlertCircle,
        title: "Information",
      };
  }
});
</script>

<template>
  <div
    class="p-5 rounded-2xl border flex items-start gap-4 transition-all duration-300 animate-fade-in"
    :class="config.color"
  >
    <!-- ICON -->
    <component :is="config.icon" class="mt-1 shrink-0" :size="22" />

    <!-- CONTENT -->
    <div class="flex-1">
      <h4 class="font-semibold">
        {{ config.title }}
      </h4>

      <p class="text-sm mt-1 opacity-90">
        {{ anomaly?.message ?? "Pas de données disponibles" }}
      </p>

      <!-- DETAILS -->
      <div
        v-if="anomaly?.data"
        class="text-xs mt-3 grid grid-cols-2 gap-2 opacity-80"
      >
        <p>Poids actuel : {{ anomaly.data.lastWeight.toFixed(1) }} kg</p>
        <p>Précédent : {{ anomaly.data.previousWeight.toFixed(1) }} kg</p>
        <p>Différence : {{ anomaly.data.difference.toFixed(2) }} kg</p>
        <p>
          Croissance :
          {{ anomaly.data.growthRate?.toFixed(1) ?? 0 }}%
        </p>
      </div>
    </div>
  </div>
</template>
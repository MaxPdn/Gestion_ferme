<script setup>
import { computed } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
} from "chart.js";

Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

const props = defineProps({
  weights: Array
});

// ✅ data devient réactif
const data = computed(() => ({
  labels: props.weights.map(w =>
    new Date(w.date).toLocaleDateString()
  ),
  datasets: [
    {
      label: "Poids",
      data: props.weights.map(w => w.value),
      borderColor: "#f97316",
      backgroundColor: "rgba(249,115,22,0.2)",
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: "#f97316"
    }
  ]
}));

const options = {
  responsive: true,
  plugins: {
    legend: { display: false }
  },
  scales: {
    x: {
      ticks: { color: "#94a3b8" }
    },
    y: {
      ticks: { color: "#94a3b8" }
    }
  }
};
</script>

<template>
  <div class="bg-slate-800 p-5 rounded-2xl border border-slate-700">

    <h3 class="font-semibold text-lg mb-4">
      Évolution du poids
    </h3>

    <!-- EMPTY -->
    <div v-if="weights.length === 0" class="text-slate-400 text-sm text-center py-10">
      Aucune donnée disponible
    </div>

    <!-- CHART -->
    <div v-else class="relative h-64 transition-all duration-300 hover:scale-[1.01]">
      <Line :data="data" :options="options" />
    </div>

  </div>
</template>
<template>
  <div class="grid-responsive-4">
    <!-- Stat Card - Total Campagnes -->
    <div class="card">
      <div class="flex items-center justify-between mb-3">
        <div class="p-3 bg-blue-50 rounded-xl">
          <Layers :size="24" class="text-blue-600" />
        </div>
        <span class="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
          {{ stats.totalActive }}
        </span>
      </div>
      <p class="text-small text-slate-500 mb-1">Total Campagnes</p>
      <p class="heading-2 text-slate-800">{{ stats.totalCampaigns }}</p>
      <p class="text-xs text-blue-600 mt-3 font-medium">
        {{ stats.totalActive }} en cours
      </p>
    </div>

    <!-- Stat Card - Animaux totaux -->
    <div class="card">
      <div class="flex items-center justify-between mb-3">
        <div class="p-3 bg-green-50 rounded-xl">
          <TrendingUp :size="24" class="text-green-600" />
        </div>
        <span class="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
          +{{ stats.monthlyGrowth }}%
        </span>
      </div>
      <p class="text-small text-slate-500 mb-1">Animaux Totaux</p>
      <p class="heading-2 text-slate-800">{{ formatNumber(stats.totalAnimals) }}</p>
      <p class="text-xs text-green-600 mt-3 font-medium">
        Croissance mensuelle
      </p>
    </div>

    <!-- Stat Card - Taux de Mortalité -->
    <div class="card">
      <div class="flex items-center justify-between mb-3">
        <div class="p-3 bg-red-50 rounded-xl">
          <AlertTriangle :size="24" class="text-red-600" />
        </div>
        <span 
          :class="[
            'inline-block px-2 py-1 text-xs font-bold rounded-full',
            stats.mortalityRate > 10 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
          ]"
        >
          {{ stats.mortalityRate.toFixed(1) }}%
        </span>
      </div>
      <p class="text-small text-slate-500 mb-1">Taux Mortalité</p>
      <p class="heading-2 text-slate-800">{{ stats.totalLosses }}</p>
      <p class="text-xs text-slate-500 mt-3 font-medium">
        sur {{ stats.totalAnimals }} sujets
      </p>
    </div>

    <!-- Stat Card - Revenus Totaux -->
    <div class="card bg-gradient-to-br from-white to-orange-50 border-orange-200">
      <div class="flex items-center justify-between mb-3">
        <div class="p-3 bg-orange-100 rounded-xl">
          <Wallet :size="24" class="text-orange-600" />
        </div>
        <span class="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
          +{{ stats.revenueGrowth }}%
        </span>
      </div>
      <p class="text-small text-slate-500 mb-1">Revenus Totaux</p>
      <p class="heading-2 text-orange-600">{{ formatCurrency(stats.totalRevenue) }}</p>
      <p class="text-xs text-slate-500 mt-3 font-medium">
        Croissance {{ stats.revenueGrowth }}% ce mois
      </p>
    </div>
  </div>
</template>

<script setup>
import { 
  Layers,
  TrendingUp,
  AlertTriangle,
  Wallet
} from 'lucide-vue-next';

defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({
      totalCampaigns: 0,
      totalActive: 0,
      totalAnimals: 0,
      totalLosses: 0,
      mortalityRate: 0,
      monthlyGrowth: 0,
      totalRevenue: 0,
      revenueGrowth: 0
    })
  }
});

const formatNumber = (num) => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(amount);
};
</script>

<style scoped>
.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1.5rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

@media (min-width: 768px) {
  .card {
    border-radius: 1.75rem;
    padding: 1.75rem;
  }
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  border-color: #f97316;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.05) 0%, transparent 70%);
  pointer-events: none;
}
</style>

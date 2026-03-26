<template>
  <div class="card group cursor-pointer h-full">
    <!-- Entête avec badge de statut -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <h3 class="dashboard-card-title text-slate-800 mb-1 line-clamp-2">{{ campaign.name }}</h3>
        <p class="dashboard-card-text text-slate-500">{{ campaign.department }}</p>
      </div>
      <span 
        :class="[
          'px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 ml-2',
          statusClasses[campaign.status] || 'bg-slate-100 text-slate-600'
        ]"
      >
        {{ campaign.status }}
      </span>
    </div>

    <!-- Informations principales -->
    <div class="space-y-3 mb-6 flex-1">
      <!-- Période -->
      <div class="flex items-center gap-3 text-sm">
        <Calendar :size="16" class="text-orange-500 flex-shrink-0" />
        <div class="min-w-0">
          <p class="dashboard-card-text text-slate-500 text-xs">Période</p>
          <p class="dashboard-card-text text-slate-700 font-medium truncate">
            {{ formatDate(campaign.startDate) }} à {{ formatDate(campaign.endDate) }}
          </p>
        </div>
      </div>

      <!-- Objectif -->
      <div class="flex items-center gap-3 text-sm">
        <Target :size="16" class="text-blue-500 flex-shrink-0" />
        <div class="min-w-0">
          <p class="text-slate-500 text-xs">Objectif</p>
          <p class="text-slate-700 font-medium">{{ campaign.objective }} sujets</p>
        </div>
      </div>

      <!-- Budget -->
      <div class="flex items-center gap-3 text-sm">
        <DollarSign :size="16" class="text-green-500 flex-shrink-0" />
        <div class="min-w-0">
          <p class="text-slate-500 text-xs">Budget</p>
          <p class="text-slate-700 font-medium">{{ formatCurrency(campaign.budget) }}</p>
        </div>
      </div>
    </div>

    <!-- Barre de progression -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <p class="text-xs font-semibold text-slate-600">Progression</p>
        <p class="text-xs font-bold text-orange-600">{{ progressPercent }}%</p>
      </div>
      <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          class="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
          :style="{ width: progressPercent + '%' }"
        />
      </div>
    </div>

    <!-- Stats rapides -->
    <div class="grid grid-cols-3 gap-2 mb-4">
      <div class="text-center p-2 bg-slate-50 rounded-lg">
        <p class="text-xs text-slate-500 font-medium">Actuel</p>
        <p class="text-lg font-bold text-slate-800">{{ campaign.currentNumber }}</p>
      </div>
      <div class="text-center p-2 bg-red-50 rounded-lg">
        <p class="text-xs text-slate-500 font-medium">Pertes</p>
        <p class="text-lg font-bold text-red-600">{{ campaign.losses }}</p>
      </div>
      <div class="text-center p-2 bg-green-50 rounded-lg">
        <p class="text-xs text-slate-500 font-medium">Vendus</p>
        <p class="text-lg font-bold text-green-600">{{ campaign.sold }}</p>
      </div>
    </div>

    <!-- Bouton d'action -->
    <button
      @click="$emit('view')"
      class="btn w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all"
    >
      <Eye :size="16" />
      Voir détails
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Calendar, Target, DollarSign, Eye } from 'lucide-vue-next';

const props = defineProps({
  campaign: {
    type: Object,
    required: true,
    default: () => ({
      name: '',
      department: '',
      status: 'En préparation',
      startDate: new Date(),
      endDate: new Date(),
      objective: 0,
      budget: 0,
      currentNumber: 0,
      losses: 0,
      sold: 0
    })
  }
});

defineEmits(['view']);

const statusClasses = {
  'En préparation': 'bg-yellow-100 text-yellow-800',
  'En cours': 'bg-blue-100 text-blue-800',
  'Terminée': 'bg-green-100 text-green-800'
};

const progressPercent = computed(() => {
  if (props.campaign.objective <= 0) return 0;
  return Math.round((props.campaign.currentNumber / props.campaign.objective) * 100);
});

const formatDate = (date) => {
  try {
    return new Date(date).toLocaleDateString('fr-FR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'N/A';
  }
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
  padding: 1.25rem;
  transition: all 0.3s ease;
}

@media (min-width: 768px) {
  .card {
    padding: 1.5rem;
    border-radius: 1.75rem;
  }
}

.card:hover {
  border-color: #f97316;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.1);
  transform: translateY(-2px);
}

.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

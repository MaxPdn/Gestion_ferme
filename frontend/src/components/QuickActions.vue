<template>
  <div class="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
    <h2 class="heading-2 text-slate-800 mb-6">Actions Rapides</h2>
    
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      <!-- Nouvelle campagne -->
      <button 
        @click="$emit('new-campaign')"
        class="action-btn group"
        title="Créer une nouvelle campagne"
      >
        <div class="icon-box">
          <Plus :size="24" class="group-hover:scale-110 transition-transform" />
        </div>
        <p class="text-xs md:text-sm font-semibold text-slate-700 text-center mt-3">
          Nouvelle Campagne
        </p>
      </button>

      <!-- Ajouter animal -->
      <button 
        @click="$emit('add-animal')"
        class="action-btn group"
        title="Ajouter un animal"
      >
        <div class="icon-box bg-green-50">
          <Plus :size="24" class="text-green-600 group-hover:scale-110 transition-transform" />
        </div>
        <p class="text-xs md:text-sm font-semibold text-slate-700 text-center mt-3">
          Ajouter Animal
        </p>
      </button>

      <!-- Vue du Suivi Santé -->
      <button 
        @click="$emit('health-check')"
        class="action-btn group"
        title="Vérifier la santé"
      >
        <div class="icon-box bg-blue-50">
          <HeartPulse :size="24" class="text-blue-600 group-hover:scale-110 transition-transform" />
        </div>
        <p class="text-xs md:text-sm font-semibold text-slate-700 text-center mt-3">
          Santé
        </p>
      </button>

      <!-- Ajouter transaction -->
      <button 
        @click="$emit('add-transaction')"
        class="action-btn group"
        title="Ajouter une transaction"
      >
        <div class="icon-box bg-orange-50">
          <DollarSign :size="24" class="text-orange-600 group-hover:scale-110 transition-transform" />
        </div>
        <p class="text-xs md:text-sm font-semibold text-slate-700 text-center mt-3">
          Transaction
        </p>
      </button>

      <!-- Rapport d'alerte -->
      <button 
        @click="$emit('report-alert')"
        class="action-btn group"
        title="Signaler une alerte"
      >
        <div class="icon-box bg-red-50">
          <AlertTriangle :size="24" class="text-red-600 group-hover:scale-110 transition-transform" />
        </div>
        <p class="text-xs md:text-sm font-semibold text-slate-700 text-center mt-3">
          Signaler Alerte
        </p>
      </button>

      <!-- Visualiser Stocks -->
      <button 
        @click="$emit('view-stocks')"
        class="action-btn group"
        title="Consulter les stocks"
      >
        <div class="icon-box bg-purple-50">
          <Package :size="24" class="text-purple-600 group-hover:scale-110 transition-transform" />
        </div>
        <p class="text-xs md:text-sm font-semibold text-slate-700 text-center mt-3">
          Stocks
        </p>
      </button>

      <!-- Génération Rapport -->
      <button 
        @click="$emit('generate-report')"
        class="action-btn group"
        title="Générer un rapport"
      >
        <div class="icon-box bg-cyan-50">
          <FileText :size="24" class="text-cyan-600 group-hover:scale-110 transition-transform" />
        </div>
        <p class="text-xs md:text-sm font-semibold text-slate-700 text-center mt-3">
          Rapport
        </p>
      </button>

      <!-- Paramètres -->
      <button 
        @click="$emit('settings')"
        class="action-btn group"
        title="Ouvrir les paramètres"
      >
        <div class="icon-box bg-slate-100">
          <Settings :size="24" class="text-slate-600 group-hover:scale-110 transition-transform" />
        </div>
        <p class="text-xs md:text-sm font-semibold text-slate-700 text-center mt-3">
          Paramètres
        </p>
      </button>
    </div>
  </div>
</template>

<script setup>
import {
  Plus,
  HeartPulse,
  DollarSign,
  AlertTriangle,
  Package,
  FileText,
  Settings
} from 'lucide-vue-next';

defineEmits([
  'new-campaign',
  'add-animal',
  'health-check',
  'add-transaction',
  'report-alert',
  'view-stocks',
  'generate-report',
  'settings'
]);
</script>

<style scoped>
.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 1.25rem 0.75rem;
  border: 2px solid transparent;
  border-radius: 1.25rem;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  min-height: 140px;
}

@media (min-width: 768px) {
  .action-btn {
    padding: 1.5rem 1rem;
    min-height: 160px;
    border-radius: 1.5rem;
  }
}

.action-btn:hover {
  background: white;
  border-color: #f97316;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.1);
  transform: translateY(-2px);
}

.action-btn:active {
  transform: scale(0.98);
}

.icon-box {
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 1rem;
  transition: all 0.3s ease;
}

@media (min-width: 768px) {
  .icon-box {
    width: 4rem;
    height: 4rem;
    border-radius: 1.125rem;
  }
}

.action-btn:hover .icon-box {
  transform: rotate(-5deg) scale(1.05);
}

.icon-box.bg-green-50 {
  background: #dcfce7;
  color: #16a34a;
}

.icon-box.bg-blue-50 {
  background: #dbeafe;
  color: #2563eb;
}

.icon-box.bg-orange-50 {
  background: #fed7aa;
  color: #ea580c;
}

.icon-box.bg-red-50 {
  background: #fee2e2;
  color: #dc2626;
}

.icon-box.bg-purple-50 {
  background: #ede9fe;
  color: #a855f7;
}

.icon-box.bg-cyan-50 {
  background: #cffafe;
  color: #0891b2;
}

.icon-box.bg-slate-100 {
  background: #e2e8f0;
  color: #475569;
}
</style>

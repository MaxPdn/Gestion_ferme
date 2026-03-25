<script setup>
import { ref, watch, computed } from 'vue';
import { useHealthStore } from '../stores/healthStore';
import axios from 'axios';
import { 
  Plus, 
  Stethoscope, 
  Syringe, 
  Eye, 
  Trash2, 
  AlertTriangle, 
  Calendar,
  X,
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-vue-next';

const healthStore = useHealthStore();
const showModal = ref(false);
const filterType = ref('all');

const campaignSearchName = ref('');
const selectedCampaignId = ref('');
const isCampaignFound = ref(false);
const searchLoading = ref(false);

const newRecord = ref({
  type: 'observation',
  title: '',
  date: new Date().toISOString().substr(0, 10),
  details: '',
  severity: 'faible',
  medication: { name: '', dosage: '' },
  withdrawalPeriod: 0,
  nextFollowUpDate: ''
});

const searchCampaign = async () => {
  if (!campaignSearchName.value.trim()) return;
  
  searchLoading.value = true;
  try {
    // On cherche la campagne par son nom via l'API du collaborateur
    const response = await axios.get(`http://localhost:7000/api/campaigns/search?name=${encodeURIComponent(campaignSearchName.value)}`);
    
    if (response.data.data && response.data.data._id) {
      selectedCampaignId.value = response.data.data._id;
      isCampaignFound.value = true;
      healthStore.fetchHealthRecords(selectedCampaignId.value);
    } else {
      resetSelection();
    }
  } catch (err) {
    resetSelection();
  } finally {
    searchLoading.value = false;
  }
};

const resetSelection = () => {
  selectedCampaignId.value = '';
  isCampaignFound.value = false;
  healthStore.records = [];
};

// On déclenche la recherche après un petit délai de frappe
let searchTimeout;
watch(campaignSearchName, () => {
  clearTimeout(searchTimeout);
  if (!campaignSearchName.value.trim()) {
    resetSelection();
    return;
  }
  searchTimeout = setTimeout(searchCampaign, 500);
});

// Statistiques Dynamiques
const activeAlertsCount = computed(() => {
  return healthStore.records.filter(r => r.severity === 'critique').length;
});

const vaccinationCount = computed(() => {
  return healthStore.records.filter(r => r.type === 'vaccination').length;
});

const lastTreatmentLabel = computed(() => {
  if (healthStore.records.length === 0) return 'Aucun';
  
  const lastRecord = healthStore.records[0]; // Déjà trié par date décroissante
  const lastDate = new Date(lastRecord.date);
  const now = new Date();
  const diffTime = Math.abs(now - lastDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  return `Il y a ${diffDays}j`;
});

// Nouveaux Computed
const filteredRecords = computed(() => {
  if (filterType.value === 'all') return healthStore.records;
  return healthStore.records.filter(r => r.type === filterType.value);
});

const activeWithdrawalCount = computed(() => {
  return healthStore.records.filter(r => isWithdrawalActive(r)).length;
});

const healthStatus = computed(() => {
  if (healthStore.records.length === 0) return { label: 'Excellent', color: 'text-green-500', bg: 'bg-green-50' };
  const criticalCount = healthStore.records.filter(r => r.severity === 'critique').length;
  if (criticalCount === 0) return { label: 'Bon', color: 'text-green-500', bg: 'bg-green-50' };
  if (criticalCount < 3) return { label: 'Vigilance', color: 'text-orange-500', bg: 'bg-orange-50' };
  return { label: 'Critique', color: 'text-red-500', bg: 'bg-red-50' };
});

const isWithdrawalActive = (record) => {
  if (!record.withdrawalPeriod || record.withdrawalPeriod <= 0) return false;
  const treatmentDate = new Date(record.date);
  const expiryDate = new Date(treatmentDate);
  expiryDate.setDate(expiryDate.getDate() + record.withdrawalPeriod);
  return new Date() < expiryDate;
};

const getWithdrawalRemaining = (record) => {
  const treatmentDate = new Date(record.date);
  const expiryDate = new Date(treatmentDate);
  expiryDate.setDate(expiryDate.getDate() + record.withdrawalPeriod);
  const diffTime = expiryDate - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const submitForm = async () => {
  if (!selectedCampaignId.value) return;
  
  const success = await healthStore.addHealthRecord(selectedCampaignId.value, newRecord.value);
  if (success) {
    showModal.value = false;
    // Reset form
    newRecord.value = {
      type: 'observation',
      title: '',
      date: new Date().toISOString().substr(0, 10),
      details: '',
      severity: 'faible',
      medication: { name: '', dosage: '' },
      withdrawalPeriod: 0,
      nextFollowUpDate: ''
    };
  }
};

const getIcon = (type) => {
  if (type === 'maladie') return Stethoscope;
  if (type === 'vaccination') return Syringe;
  return Eye;
};

const getTypeColor = (type) => {
  if (type === 'maladie') return 'text-red-500 bg-red-50';
  if (type === 'vaccination') return 'text-blue-500 bg-blue-50';
  return 'text-green-500 bg-green-50';
};
</script>

<template>
  <div class="p-8 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-bold text-slate-800">Santé & Traitements</h1>
          <span v-if="isCampaignFound" :class="['px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border', healthStatus.color, healthStatus.bg, healthStatus.color.replace('text', 'border')]">
            Santé: {{ healthStatus.label }}
          </span>
        </div>
        <p class="text-slate-500 mt-1">
          <span v-if="isCampaignFound" class="flex items-center gap-2 text-orange-600 font-bold">
            <CheckCircle2 :size="16" /> Campagne identifiée : {{ campaignSearchName }}
          </span>
          <span v-else-if="campaignSearchName && !searchLoading" class="flex items-center gap-2 text-red-400 italic">
            <XCircle :size="16" /> Campagne introuvable
          </span>
          <span v-else class="text-slate-400 italic">Recherchez une campagne pour voir l'historique</span>
        </p>
      </div>

      <div class="flex items-center gap-4 w-full md:w-auto">
        <!-- Input de recherche de campagne -->
        <div class="relative flex-1 md:w-80">
          <input 
            v-model="campaignSearchName"
            type="text"
            placeholder="Saisir le nom de la campagne..."
            class="w-full bg-white border border-slate-200 rounded-xl px-11 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm"
          />
          <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <div v-if="searchLoading" class="absolute right-4 top-1/2 -translate-y-1/2">
            <div class="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        <button 
          @click="showModal = true"
          :disabled="!isCampaignFound"
          class="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/20 disabled:shadow-none"
        >
          <Plus :size="20" />
          Nouvel événement
        </button>
      </div>
    </div>

    <!-- Stats Rapides -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-red-50 rounded-xl text-red-500">
            <AlertTriangle :size="24" />
          </div>
          <div>
            <p class="text-sm text-slate-500 font-medium">Alertes Actives</p>
            <p class="text-2xl font-bold text-slate-800">{{ activeAlertsCount }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-blue-50 rounded-xl text-blue-500">
            <Syringe :size="24" />
          </div>
          <div>
            <p class="text-sm text-slate-500 font-medium">Vaccins</p>
            <p class="text-2xl font-bold text-slate-800">{{ vaccinationCount }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-orange-50 rounded-xl text-orange-500">
            <Calendar :size="24" />
          </div>
          <div>
            <p class="text-sm text-slate-500 font-medium">Dernier Traitement</p>
            <p class="text-2xl font-bold text-slate-800">{{ lastTreatmentLabel }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div class="flex items-center gap-4">
          <div :class="['p-3 rounded-xl', activeWithdrawalCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-green-50 text-green-600']">
            <AlertTriangle :size="24" />
          </div>
          <div>
            <p class="text-sm text-slate-500 font-medium">Délai Attente Actif</p>
            <p class="text-2xl font-bold text-slate-800">{{ activeWithdrawalCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline des records -->
    <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <!-- Filtres -->
      <div class="px-6 py-4 border-b border-slate-50 flex items-center gap-2 overflow-x-auto">
        <button 
          v-for="filter in [
            { id: 'all', label: 'Tout' },
            { id: 'maladie', label: 'Maladies' },
            { id: 'vaccination', label: 'Vaccinations' },
            { id: 'observation', label: 'Observations' }
          ]" 
          :key="filter.id"
          @click="filterType = filter.id"
          :class="[
            'px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap',
            filterType === filter.id ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          ]"
        >
          {{ filter.label }}
        </button>
      </div>

      <div v-if="healthStore.loading" class="p-20 text-center text-slate-400">
        Chargement de l'historique...
      </div>
      
      <div v-else-if="filteredRecords.length === 0" class="p-20 text-center text-slate-400">
        Aucun événement trouvé pour ce filtre.
      </div>

      <div v-else class="divide-y divide-slate-50">
        <div v-for="record in filteredRecords" :key="record._id" class="p-6 hover:bg-slate-50/50 transition-colors group">
          <div class="flex gap-6">
            <!-- Icone & Type -->
            <div :class="['p-4 rounded-2xl h-fit', getTypeColor(record.type)]">
              <component :is="getIcon(record.type)" :size="24" />
            </div>

            <!-- Content -->
            <div class="flex-1">
              <div class="flex justify-between items-start">
                <div>
                  <div class="flex items-center gap-3">
                    <h3 class="text-lg font-bold text-slate-800">{{ record.title }}</h3>
                    <span :class="[
                      'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                      record.severity === 'critique' ? 'bg-red-100 text-red-600' : 
                      record.severity === 'modérée' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                    ]">
                      {{ record.severity }}
                    </span>
                  </div>
                  <p class="text-sm text-slate-500 mt-1 font-medium">
                    {{ new Date(record.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }}
                  </p>
                </div>
                <button @click="healthStore.deleteRecord(record._id)" class="text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 :size="18" />
                </button>
              </div>

              <p class="text-slate-600 mt-4 leading-relaxed">{{ record.details }}</p>

              <!-- Informations complémentaires -->
              <div class="mt-4 flex flex-wrap gap-4">
                <!-- Médicament -->
                <div v-if="record.medication?.name" class="bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <span class="text-slate-400">Médicament:</span> {{ record.medication.name }}
                </div>
                <div v-if="record.medication?.dosage" class="bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <span class="text-slate-400">Dosage:</span> {{ record.medication.dosage }}
                </div>

                <!-- Délai d'attente (Alerte Visuelle) -->
                <div v-if="record.withdrawalPeriod > 0" 
                  :class="[
                    'px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold border',
                    isWithdrawalActive(record) ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'
                  ]">
                  <AlertTriangle v-if="isWithdrawalActive(record)" :size="14" />
                  <CheckCircle2 v-else :size="14" />
                  Délai d'attente: {{ record.withdrawalPeriod }} jours 
                  <span v-if="isWithdrawalActive(record)" class="ml-1 opacity-75">
                    (Reste {{ getWithdrawalRemaining(record) }}j)
                  </span>
                </div>

                <!-- Prochain Rappel -->
                <div v-if="record.nextFollowUpDate" class="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold border border-blue-100">
                  <Calendar :size="14" />
                  Rappel prévu le: {{ new Date(record.nextFollowUpDate).toLocaleDateString('fr-FR') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Formulaire -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 class="text-xl font-bold text-slate-800">Nouvel événement santé</h2>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 transition-colors">
            <X :size="24" />
          </button>
        </div>

        <form @submit.prevent="submitForm" class="p-8 space-y-5">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700">Type</label>
              <select v-model="newRecord.type" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all">
                <option value="observation">Observation</option>
                <option value="maladie">Maladie</option>
                <option value="vaccination">Vaccination</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700">Date</label>
              <input v-model="newRecord.date" type="date" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-slate-700">Titre de l'événement</label>
            <input v-model="newRecord.title" type="text" placeholder="ex: Rappel Gumboro, Observation Diarrhée..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700">Médicament / Produit</label>
              <input v-model="newRecord.medication.name" type="text" placeholder="Nom du produit" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700">Dosage</label>
              <input v-model="newRecord.medication.dosage" type="text" placeholder="ex: 10ml / 100L" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-slate-700">Observations détaillées</label>
            <textarea v-model="newRecord.details" rows="3" placeholder="Décrivez les symptômes ou le protocole..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"></textarea>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700">Sévérité</label>
              <select v-model="newRecord.severity" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all">
                <option value="faible">Faible</option>
                <option value="modérée">Modérée</option>
                <option value="critique">Critique</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700">Délai attente (j)</label>
              <input v-model="newRecord.withdrawalPeriod" type="number" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700">Prochain Rappel</label>
              <input v-model="newRecord.nextFollowUpDate" type="date" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
            </div>
          </div>

          <div class="pt-4">
            <button 
              type="submit"
              class="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/20 transition-all active:scale-95"
            >
              Enregistrer l'événement
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: fadeInScale 0.3s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

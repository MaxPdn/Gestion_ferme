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
  <div class="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
    <!-- Header -->
    <div class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div class="space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 class="heading-1 text-slate-800">Santé & Traitements</h1>
              <p class="text-small text-slate-500 mt-1">Suivez l'historique médical de vos campagnes</p>
            </div>
            <div v-if="isCampaignFound" :class="['px-3 py-2 rounded-full text-xs font-bold uppercase tracking-widest border', healthStatus.color, healthStatus.bg]">
              {{ healthStatus.label }}
            </div>
          </div>

          <!-- Barre de recherche -->
          <div class="flex flex-col sm:flex-row gap-2 w-full">
            <div class="relative flex-1">
              <input 
                v-model="campaignSearchName"
                type="text"
                placeholder="Nom de la campagne..."
                class="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
              />
              <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <div v-if="searchLoading" class="absolute right-3 top-1/2 -translate-y-1/2">
                <div class="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <button 
              @click="showModal = true"
              :disabled="!isCampaignFound"
              class="btn bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-semibold self-start sm:self-auto"
            >
              <Plus :size="18" />
              Événement
            </button>
          </div>

          <!-- Statut -->
          <div v-if="campaignSearchName && !searchLoading" class="flex items-start gap-2 text-sm">
            <CheckCircle2 v-if="isCampaignFound" :size="16" class="text-green-600 flex-shrink-0 mt-0.5" />
            <XCircle v-else :size="16" class="text-red-400 flex-shrink-0 mt-0.5" />
            <span :class="isCampaignFound ? 'text-green-700' : 'text-red-600'">
              {{ isCampaignFound ? `Campagne trouvée: ${campaignSearchName}` : 'Campagne introuvable' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <main v-if="isCampaignFound" class="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      <!-- Stats Rapides -->
      <section>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <div class="card">
            <div class="flex flex-col items-start">
              <div class="p-2.5 md:p-3 bg-red-50 text-red-500 rounded-lg mb-3">
                <AlertTriangle :size="20" />
              </div>
              <p class="text-xs md:text-small text-slate-500 font-semibold mb-1">Alertes Actives</p>
              <p class="heading-2 text-slate-800">{{ activeAlertsCount }}</p>
            </div>
          </div>
          <div class="card">
            <div class="flex flex-col items-start">
              <div class="p-2.5 md:p-3 bg-blue-50 text-blue-500 rounded-lg mb-3">
                <Syringe :size="20" />
              </div>
              <p class="text-xs md:text-small text-slate-500 font-semibold mb-1">Vaccins</p>
              <p class="heading-2 text-slate-800">{{ vaccinationCount }}</p>
            </div>
          </div>
          <div class="card">
            <div class="flex flex-col items-start">
              <div class="p-2.5 md:p-3 bg-orange-50 text-orange-500 rounded-lg mb-3">
                <Calendar :size="20" />
              </div>
              <p class="text-xs md:text-small text-slate-500 font-semibold mb-1">Dernier Traitement</p>
              <p class="heading-2 text-slate-800 text-base md:text-lg">{{ lastTreatmentLabel }}</p>
            </div>
          </div>
          <div class="card">
            <div class="flex flex-col items-start">
              <div :class="['p-2.5 md:p-3 rounded-lg mb-3', activeWithdrawalCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-green-50 text-green-600']">
                <AlertTriangle :size="20" />
              </div>
              <p class="text-xs md:text-small text-slate-500 font-semibold mb-1">Délai Attente</p>
              <p class="heading-2 text-slate-800">{{ activeWithdrawalCount }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Liste des enregistrements -->
      <section class="card">
        <!-- Filtres -->
        <div class="p-4 md:p-6 border-b border-slate-200 flex flex-wrap gap-2">
          <button 
            v-for="filter in [
              { id: 'all', label: 'Tout' },
              { id: 'maladie', label: 'Maladies' },
              { id: 'vaccination', label: 'Vaccins'  },
              { id: 'observation', label: 'Observations' }
            ]" 
            :key="filter.id"
            @click="filterType = filter.id"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
              filterType === filter.id ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            ]"
          >
            {{ filter.label }}
          </button>
        </div>

        <div v-if="healthStore.loading" class="p-8 md:p-12 text-center">
          <div class="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-b-orange-500 mx-auto mb-4"></div>
          <p class="text-slate-400 text-sm">Chargement...</p>
        </div>
        
        <div v-else-if="filteredRecords.length === 0" class="p-8 md:p-12 text-center">
          <p class="text-slate-500 text-sm">Aucun événement trouvé</p>
        </div>

        <div v-else class="divide-y divide-slate-100">
          <div v-for="record in filteredRecords" :key="record._id" class="p-4 md:p-6 hover:bg-slate-50/50 transition-colors">
            <div class="flex gap-3 md:gap-6">
              <!-- Icône -->
              <div :class="['p-2 md:p-3 rounded-lg h-fit flex-shrink-0', getTypeColor(record.type)]">
                <component :is="getIcon(record.type)" :size="20" />
              </div>

              <!-- Contenu -->
              <div class="min-w-0 flex-1">
                <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                  <div class="min-w-0">
                    <h3 class="font-bold text-slate-800 text-sm md:text-base truncate">
                      {{ record.title }}
                    </h3>
                    <p class="text-xs md:text-small text-slate-500 mt-1">
                      {{ new Date(record.date).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      }) }}
                    </p>
                  </div>
                  <button 
                    @click="healthStore.deleteRecord(record._id)"
                    class="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 :size="18" />
                  </button>
                </div>

                <!-- Sévérité -->
                <div class="mb-3">
                  <span :class="[
                    'px-2 py-1 rounded text-xs font-bold',
                    record.severity === 'critique' ? 'bg-red-100 text-red-700' : 
                    record.severity === 'modérée' ? 'bg-orange-100 text-orange-700' : 
                    'bg-green-100 text-green-700'
                  ]">
                    {{ record.severity }}
                  </span>
                </div>

                <!-- Description -->
                <p class="text-slate-600 text-sm mb-3 leading-relaxed">{{ record.details }}</p>

                <!-- Infos complémentaires -->
                <div class="flex flex-wrap gap-2 mb-3">
                  <div v-if="record.medication?.name" class="bg-slate-100 px-2 py-1 rounded text-xs font-semibold text-slate-700">
                    💊 {{ record.medication.name }}
                  </div>
                  <div v-if="record.medication?.dosage" class="bg-slate-100 px-2 py-1 rounded text-xs font-semibold text-slate-700">
                    📊 {{ record.medication.dosage }}
                  </div>
                </div>

                <!-- Délai d'attente et rappels -->
                <div class="space-y-2">
                  <div v-if="record.withdrawalPeriod > 0" 
                    :class="[
                      'px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-bold',
                      isWithdrawalActive(record) ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                    ]">
                    <AlertTriangle v-if="isWithdrawalActive(record)" :size="14" />
                    <CheckCircle2 v-else :size="14" />
                    <span>
                      Délai d'attente: {{ record.withdrawalPeriod }}j
                      <span v-if="isWithdrawalActive(record)" class="ml-1">(Reste {{ getWithdrawalRemaining(record) }}j)</span>
                    </span>
                  </div>

                  <div v-if="record.nextFollowUpDate" class="px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <Calendar :size="14" />
                    Rappel: {{ new Date(record.nextFollowUpDate).toLocaleDateString('fr-FR') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Message quand aucune campagne n'est sélectionnée -->
    <main v-else class="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div class="card text-center py-12">
        <Stethoscope :size="48" class="mx-auto text-slate-300 mb-4" />
        <p class="text-slate-500 text-sm md:text-base">Recherchez une campagne pour voir l'historique de santé</p>
      </div>
    </main>

    <!-- Modal Formulaire -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md md:max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto">
        <div class="sticky top-0 p-4 md:p-6 border-b border-slate-200 bg-white flex items-center justify-between">
          <h2 class="heading-2 text-slate-800">Nouvel événement</h2>
          <button 
            @click="showModal = false"
            class="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="submitForm" class="p-4 md:p-6 space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs md:text-small text-slate-600 font-semibold block mb-2">Type</label>
              <select v-model="newRecord.type" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10">
                <option value="observation">Observation</option>
                <option value="maladie">Maladie</option>
                <option value="vaccination">Vaccination</option>
              </select>
            </div>
            <div>
              <label class="text-xs md:text-small text-slate-600 font-semibold block mb-2">Date</label>
              <input v-model="newRecord.date" type="date" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10" />
            </div>
          </div>

          <div>
            <label class="text-xs md:text-small text-slate-600 font-semibold block mb-2">Titre</label>
            <input v-model="newRecord.title" type="text" placeholder="ex: Rappel Gumboro..." class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs md:text-small text-slate-600 font-semibold block mb-2">Médicament</label>
              <input v-model="newRecord.medication.name" type="text" placeholder="Nom du produit" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10" />
            </div>
            <div>
              <label class="text-xs md:text-small text-slate-600 font-semibold block mb-2">Dosage</label>
              <input v-model="newRecord.medication.dosage" type="text" placeholder="ex: 10ml / 100L" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10" />
            </div>
          </div>

          <div>
            <label class="text-xs md:text-small text-slate-600 font-semibold block mb-2">Détails</label>
            <textarea v-model="newRecord.details" rows="2" placeholder="Observations..." class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10" />
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="text-xs md:text-small text-slate-600 font-semibold block mb-2">Sévérité</label>
              <select v-model="newRecord.severity" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10">
                <option value="faible">Faible</option>
                <option value="modérée">Modérée</option>
                <option value="critique">Critique</option>
              </select>
            </div>
            <div>
              <label class="text-xs md:text-small text-slate-600 font-semibold block mb-2">Délai (j)</label>
              <input v-model.number="newRecord.withdrawalPeriod" type="number" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10" />
            </div>
            <div>
              <label class="text-xs md:text-small text-slate-600 font-semibold block mb-2">Rappel</label>
              <input v-model="newRecord.nextFollowUpDate" type="date" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10" />
            </div>
          </div>

          <div class="flex gap-2 pt-2">
            <button 
              type="submit"
              class="flex-1 btn bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              Enregistrer
            </button>
            <button 
              type="button"
              @click="showModal = false"
              class="flex-1 btn bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>


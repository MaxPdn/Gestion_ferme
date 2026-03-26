<script setup>
import { ref, onMounted, computed } from 'vue';
import { useFinanceStore } from '../stores/financeStore';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  Trash2, 
  Calendar,
  X
} from 'lucide-vue-next';
import axios from 'axios';
import { useAutoRefresh } from '../composables/useAutoRefresh';

const { triggerRefresh, onRefresh } = useAutoRefresh();

const financeStore = useFinanceStore();
const showModal = ref(false);
const filterType = ref('all');

const newTransaction = ref({
  type: 'dépense',
  category: 'alimentation',
  amount: 0,
  description: '',
  date: new Date().toISOString().substr(0, 10),
  campaignId: ''
});

const campaigns = ref([]);

const fetchCampaigns = async () => {
  try {
    const res = await axios.get('http://localhost:7000/api/campaigns');
    campaigns.value = res.data;
  } catch (err) {
    console.error('Erreur chargement campagnes:', err);
  }
};

onMounted(async () => {
  await financeStore.fetchAllTransactions();
  await financeStore.fetchFinanceStats();
  await fetchCampaigns();
});

onRefresh(async () => {
  await financeStore.fetchAllTransactions();
  await financeStore.fetchFinanceStats();
});

const filteredTransactions = computed(() => {
  let result = financeStore.transactions;
  if (filterType.value !== 'all') {
    result = result.filter(t => t.type === filterType.value);
  }
  return result;
});

const submitTransaction = async () => {
  if (newTransaction.value.amount <= 0) return;
  const success = await financeStore.addTransaction(newTransaction.value);
  if (success) {
    showModal.value = false;
    triggerRefresh();
    newTransaction.value = {
      type: 'dépense',
      category: 'alimentation',
      amount: 0,
      description: '',
      date: new Date().toISOString().substr(0, 10),
      campaignId: ''
    };
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
};

const getTypeColor = (type) => {
  return type === 'recette' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
};
</script>

<template>
  <div class="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
    <!-- Header -->
    <div class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div class="flex flex-col sm:items-start gap-4">
          <div>
            <h1 class="heading-1 text-slate-800">Gestion Financière</h1>
            <p class="text-small text-slate-500 mt-2">Suivez vos revenus et dépenses en temps réel</p>
          </div>
          <button 
            @click="showModal = true"
            class="btn bg-orange-500 hover:bg-orange-600 text-white font-semibold self-start"
          >
            <Plus :size="18" />
            Nouvelle Transaction
          </button>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <main class="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <!-- Stats Cards -->
      <section class="mb-10">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="card">
            <div class="flex flex-col sm:flex-row sm:items-center gap-4">
              <div class="p-3 bg-green-50 text-green-600 rounded-xl flex-shrink-0">
                <TrendingUp :size="24" />
              </div>
              <div class="min-w-0">
                <p class="text-small text-slate-500 font-bold uppercase tracking-wider">Total Recettes</p>
                <p class="text-2xl md:text-3xl font-black text-slate-800 truncate">
                  {{ formatCurrency(financeStore.stats.recettes) }}
                </p>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="flex flex-col sm:flex-row sm:items-center gap-4">
              <div class="p-3 bg-red-50 text-red-600 rounded-xl flex-shrink-0">
                <TrendingDown :size="24" />
              </div>
              <div class="min-w-0">
                <p class="text-small text-slate-500 font-bold uppercase tracking-wider">Total Dépenses</p>
                <p class="text-2xl md:text-3xl font-black text-slate-800 truncate">
                  {{ formatCurrency(financeStore.stats.dépenses) }}
                </p>
              </div>
            </div>
          </div>

          <div class="card bg-gradient-to-br from-white to-orange-50 border-orange-200">
            <div class="flex flex-col sm:flex-row sm:items-center gap-4">
              <div class="p-3 bg-orange-500 text-white rounded-xl flex-shrink-0 shadow-lg shadow-orange-500/20">
                <Wallet :size="24" />
              </div>
              <div class="min-w-0">
                <p class="text-small text-slate-500 font-bold uppercase tracking-wider">Solde Actuel</p>
                <p :class="['text-2xl md:text-3xl font-black truncate', financeStore.stats.balance >= 0 ? 'text-slate-800' : 'text-red-600']">
                  {{ formatCurrency(financeStore.stats.balance) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Transactions List -->
      <section class="card overflow-hidden">
        <!-- Filtres -->
        <div class="p-4 md:p-6 border-b border-slate-50">
          <div class="flex flex-wrap items-center gap-2">
            <button 
              @click="filterType = 'all'"
              :class="['px-4 py-2 rounded-lg text-xs font-bold transition-all', filterType === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200']"
            >
              Tout
            </button>
            <button 
              @click="filterType = 'recette'"
              :class="['px-4 py-2 rounded-lg text-xs font-bold transition-all', filterType === 'recette' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200']"
            >
              Recettes
            </button>
            <button 
              @click="filterType = 'dépense'"
              :class="['px-4 py-2 rounded-lg text-xs font-bold transition-all', filterType === 'dépense' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200']"
            >
              Dépenses
            </button>
          </div>
        </div>

        <!-- Table responsive -->
        <div class="overflow-x-auto">
          <div class="min-w-max md:min-w-full">
            <!-- Desktop: Table -->
            <table class="w-full text-left border-collapse hidden md:table">
              <thead>
                <tr class="bg-slate-50/50">
                  <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Catégorie</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Description</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Campagne</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Montant</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="t in filteredTransactions" :key="t._id" class="hover:bg-slate-50/50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <Calendar :size="14" class="hidden sm:block flex-shrink-0 text-slate-400" />
                      {{ new Date(t.date).toLocaleDateString('fr-FR') }}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                      {{ t.category }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm font-semibold text-slate-700">{{ t.description || '-' }}</td>
                  <td class="px-6 py-4">
                    <span v-if="t.campaign" class="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                      {{ t.campaign.name }}
                    </span>
                    <span v-else class="text-xs text-slate-400 italic">Hors</span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span :class="['font-bold text-sm px-3 py-1 rounded-lg', getTypeColor(t.type)]">
                      {{ t.type === 'recette' ? '+' : '-' }} {{ formatCurrency(t.amount) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Mobile: Cards -->
            <div class="md:hidden p-4 space-y-3">
              <div 
                v-for="t in filteredTransactions" 
                :key="t._id" 
                class="bg-slate-50 rounded-lg p-4 border border-slate-100"
              >
                <div class="flex items-center justify-between mb-3">
                  <p class="text-xs font-bold text-slate-500 uppercase">{{ new Date(t.date).toLocaleDateString('fr-FR') }}</p>
                  <span :class="['font-bold text-sm px-2 py-1 rounded-lg text-xs', getTypeColor(t.type)]">
                    {{ t.type === 'recette' ? '+' : '-' }} {{ formatCurrency(t.amount) }}
                  </span>
                </div>
                <p class="font-semibold text-slate-800 mb-2 truncate">{{ t.description || '-' }}</p>
                <div class="flex flex-wrap gap-2 text-xs">
                  <span class="px-2 py-1 rounded bg-slate-100 text-slate-600 font-bold">{{ t.category }}</span>
                  <span v-if="t.campaign" class="px-2 py-1 rounded bg-orange-50 text-orange-600 font-bold">
                    {{ t.campaign.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredTransactions.length === 0" class="text-center py-12 p-4">
          <p class="text-slate-500 mb-4">Aucune transaction trouvée</p>
        </div>
      </section>
    </main>

    <!-- Modal Nouvelle Transaction -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-screen overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-slate-200 p-4 md:p-6 flex items-center justify-between">
          <h2 class="heading-2 text-slate-800">Nouvelle Transaction</h2>
          <button 
            @click="showModal = false"
            class="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X :size="24" />
          </button>
        </div>

        <form @submit.prevent="submitTransaction" class="p-4 md:p-6 space-y-4">
          <div>
            <label class="text-small text-slate-600 font-semibold block mb-2">Type</label>
            <div class="flex gap-2">
              <button 
                type="button"
                @click="newTransaction.type = 'dépense'"
                :class="['flex-1 py-2 rounded-lg font-bold text-sm transition-all', newTransaction.type === 'dépense' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
              >
                Dépense
              </button>
              <button 
                type="button"
                @click="newTransaction.type = 'recette'"
                :class="['flex-1 py-2 rounded-lg font-bold text-sm transition-all', newTransaction.type === 'recette' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
              >
                Recette
              </button>
            </div>
          </div>

          <div>
            <label class="text-small text-slate-600 font-semibold block mb-2">Catégorie</label>
            <select v-model="newTransaction.category" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10">
              <option value="alimentation">Alimentation</option>
              <option value="médicament">Médicament</option>
              <option value="équipement">Équipement</option>
              <option value="vente">Vente</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div>
            <label class="text-small text-slate-600 font-semibold block mb-2">Montant (XOF)</label>
            <input 
              v-model.number="newTransaction.amount" 
              type="number" 
              placeholder="0"
              required
              class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
            />
          </div>

          <div>
            <label class="text-small text-slate-600 font-semibold block mb-2">Description</label>
            <input 
              v-model="newTransaction.description" 
              type="text" 
              placeholder="Détails de la transaction..."
              class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
            />
          </div>

          <div>
            <label class="text-small text-slate-600 font-semibold block mb-2">Date</label>
            <input 
              v-model="newTransaction.date" 
              type="date"
              required
              class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
            />
          </div>

          <div>
            <label class="text-small text-slate-600 font-semibold block mb-2">Campagne</label>
            <select v-model="newTransaction.campaignId" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10">
              <option value="">Hors campagne</option>
              <option v-for="c in campaigns" :key="c._id" :value="c._id">{{ c.name }}</option>
            </select>
          </div>

          <div class="flex gap-2 pt-4 border-t border-slate-100">
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

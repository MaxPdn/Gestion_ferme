<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import {
  getCampaign,
  addLoss,
  addSale,
  updateStatus,
} from "../services/campaignService";
import { useFinanceStore } from "../stores/financeStore";
import { 
  Plus, 
  Trash2, 
  BadgeDollarSign, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  ChevronLeft,
  Users,
  Info,
  Calendar,
  CheckCircle2
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const financeStore = useFinanceStore();

const campaign = ref(null);
const loading = ref(true);
const campaignTransactions = ref([]);

const lossInput = ref(0);
const saleInput = ref(0);

const fetchCampaign = async () => {
  try {
    const res = await getCampaign(route.params.id);
    campaign.value = res.data;
    
    // Charger les transactions de la campagne
    const transRes = await axios.get(`http://localhost:7000/api/finance/campaign/${route.params.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    campaignTransactions.value = transRes.data.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCampaign);

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
};

const campaignStats = computed(() => {
  const recettes = campaignTransactions.value
    .filter(t => t.type === 'recette')
    .reduce((acc, t) => acc + t.amount, 0);
  const dépenses = campaignTransactions.value
    .filter(t => t.type === 'dépense')
    .reduce((acc, t) => acc + t.amount, 0);
  return { recettes, dépenses, balance: recettes - dépenses };
});

const handleAddLoss = async () => {
  const quantity = Number(lossInput.value);
  if (quantity <= 0) return;

  // 🛡️ Sécurité : Pas plus de pertes que d'animaux
  if (quantity > campaign.value.currentCount) {
    return notify(
      `Impossible : il ne reste que ${campaign.value.currentCount} animaux.`,
      "error",
    );
  }

  try {
    await addLoss(campaign.value._id, quantity);
    notify("Perte enregistrée avec succès", "success");
    lossInput.value = 0;
    await fetchCampaign();
  } catch (err) {
    notify(
      err.response?.data?.message || "Erreur lors de l'enregistrement",
      "error",
    );
  }
};

const handleAddSale = async () => {
  const quantity = Number(saleInput.value);
  if (quantity <= 0) return;

  // 🛡️ Sécurité 1 : Campagne doit être active
  if (campaign.value.status !== "active") {
    return notify(
      "Vente impossible : la campagne n'est pas 'En cours'.",
      "error",
    );
  }

  // 🛡️ Sécurité 2 : Stock suffisant
  if (quantity > campaign.value.currentCount) {
    return notify(
      `Stock insuffisant : ${campaign.value.currentCount} restants.`,
      "error",
    );
  }

  try {
    await addSale(campaign.value._id, quantity);
    notify("Vente réussie ! 💰", "success");
    saleInput.value = 0;
    await fetchCampaign();
  } catch (err) {
    notify(err.response?.data?.message || "Erreur lors de la vente", "error");
  }
};

const handleStatusChange = async (status) => {
  await updateStatus(campaign.value._id, status);
  await fetchCampaign();
};
</script>

<template>
  <div class="p-4 md:p-8 font-serif bg-slate-50 min-h-screen">
    <!-- Header with Back Button -->
    <div class="flex items-center gap-4 mb-8">
      <button
        @click="router.back()"
        class="p-3 bg-white rounded-2xl shadow-sm hover:bg-slate-100 transition-all active:scale-95 text-slate-600 border border-slate-100"
      >
        <ChevronLeft :size="24" />
      </button>
      <div>
        <h1 class="text-2xl md:text-3xl font-black text-slate-800" v-if="campaign">
          {{ campaign.name }}
        </h1>
        <p class="text-slate-500 text-sm font-medium">Gestion détaillée de la campagne</p>
      </div>
    </div>

    <div v-if="!loading && campaign" class="space-y-8">
      <!-- Top Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Effectif Actuel</p>
            <p class="text-3xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">{{ campaign.currentCount }}</p>
          </div>
          <div class="p-4 bg-blue-50 text-blue-500 rounded-2xl">
            <Users :size="24" />
          </div>
        </div>

        <div class="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between group hover:border-red-200 transition-colors">
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pertes Totales</p>
            <p class="text-3xl font-black text-red-600 group-hover:text-red-700 transition-colors">{{ campaign.losses }}</p>
          </div>
          <div class="p-4 bg-red-50 text-red-500 rounded-2xl">
            <TrendingDown :size="24" />
          </div>
        </div>

        <div class="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between group hover:border-green-200 transition-colors">
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Animaux Vendus</p>
            <p class="text-3xl font-black text-green-600 group-hover:text-green-700 transition-colors">{{ campaign.sold }}</p>
          </div>
          <div class="p-4 bg-green-50 text-green-500 rounded-2xl">
            <BadgeDollarSign :size="24" />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Info Panel -->
        <div class="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 h-fit">
          <h3 class="font-black text-slate-800 mb-6 flex items-center gap-3">
            <Info :size="20" class="text-slate-400" />
            Informations
          </h3>
          <div class="space-y-4">
            <div class="flex justify-between py-3 border-b border-slate-50">
              <span class="text-slate-400 text-xs font-bold uppercase tracking-wider">Département</span>
              <span class="font-black text-slate-700 text-sm">{{ campaign.department?.name || "N/A" }}</span>
            </div>
            <div class="flex justify-between py-3 border-b border-slate-50">
              <span class="text-slate-400 text-xs font-bold uppercase tracking-wider">Objectif</span>
              <span class="font-black text-slate-700 text-sm">{{ campaign.objective || "Non défini" }}</span>
            </div>
            <div class="flex justify-between py-3">
              <span class="text-slate-400 text-xs font-bold uppercase tracking-wider">Statut</span>
              <span
                class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
                :class="{
                  'bg-amber-100 text-amber-700': campaign.status === 'preparation',
                  'bg-green-100 text-green-700': campaign.status === 'active',
                  'bg-slate-100 text-slate-500': campaign.status === 'completed',
                }"
              >
                {{ campaign.status }}
              </span>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 grid md:grid-cols-2 gap-6">
          <div
            class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
          >
            <h3 class="font-bold text-gray-800 mb-4">Signaler des Pertes</h3>

            <div class="flex gap-2">
              <input
                v-model="lossInput"
                type="number"
                class="flex-1 bg-slate-50 border-slate-200 border rounded-2xl px-4 py-4 font-black text-slate-700 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:outline-none transition-all"
                placeholder="0"
              />

              <button
                @click="handleAddLoss"
                class="bg-slate-800 hover:bg-slate-900 text-white font-bold px-8 rounded-2xl transition-all active:scale-95 shadow-lg shadow-slate-900/10"
              >
                OK
              </button>
            </div>
          </div>

          <div
            class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
            :class="{
              'opacity-50 grayscale-[0.5]': campaign.status !== 'active',
            }"
          >
            <h3 class="font-bold text-gray-800 mb-4 flex justify-between">
              Enregistrer des Ventes
              <span
                v-if="campaign.status !== 'active'"
                class="text-[10px] text-red-500 uppercase italic"
                >Verrouillé</span
              >
            </h3>
            <div class="flex gap-2">
              <input
                v-model="saleInput"
                type="number"
                :disabled="campaign.status !== 'active'"
                class="flex-1 border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all disabled:bg-gray-100"
                placeholder="Ex: 5"
              />
              <button
                @click="handleAddSale"
                :disabled="campaign.status !== 'active'"
                class="'h-full bg-[#1e293b] hover:'h-full [#1e293b] text-white font-bold px-6 rounded-xl transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Lifecycle Management -->
      <div class="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
        <h3 class="font-black text-slate-800 mb-8 flex items-center gap-3">
          <span class="w-1.5 h-5 bg-orange-500 rounded-full"></span>
          Cycle de vie de la campagne
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            @click="handleStatusChange('preparation')"
            class="group flex flex-col items-center gap-4 p-6 rounded-3xl font-black transition-all duration-300 border-2"
            :class="
              campaign.status === 'preparation'
                ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-md'
                : 'bg-slate-50/50 border-transparent text-slate-400 hover:bg-white hover:border-amber-100 hover:text-amber-600'
            "
          >
            <div
              class="p-4 rounded-2xl transition-all duration-300 shadow-sm"
              :class="
                campaign.status === 'preparation'
                  ? 'bg-white text-amber-500 scale-110'
                  : 'bg-white group-hover:bg-amber-50'
              "
            >
              <Calendar :size="28" />
            </div>
            <span class="text-sm uppercase tracking-widest">Préparation</span>
          </button>

          <button
            @click="handleStatusChange('active')"
            class="group flex flex-col items-center gap-4 p-6 rounded-3xl font-black transition-all duration-300 border-2"
            :class="
              campaign.status === 'active'
                ? 'bg-green-50 border-green-200 text-green-700 shadow-md'
                : 'bg-slate-50/50 border-transparent text-slate-400 hover:bg-white hover:border-green-100 hover:text-green-600'
            "
          >
            <div
              class="p-4 rounded-2xl transition-all duration-300 shadow-sm"
              :class="
                campaign.status === 'active'
                  ? 'bg-white text-green-500 scale-110'
                  : 'bg-white group-hover:bg-green-50'
              "
            >
              <TrendingUp :size="28" />
            </div>
            <span class="text-sm uppercase tracking-widest">En cours</span>
          </button>

          <button
            @click="handleStatusChange('completed')"
            class="group flex flex-col items-center gap-4 p-6 rounded-3xl font-black transition-all duration-300 border-2"
            :class="
              campaign.status === 'completed'
                ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-md'
                : 'bg-slate-50/50 border-transparent text-slate-400 hover:bg-white hover:border-blue-100 hover:text-blue-600'
            "
          >
            <div
              class="p-4 rounded-2xl transition-all duration-300 shadow-sm"
              :class="
                campaign.status === 'completed'
                  ? 'bg-white text-blue-500 scale-110'
                  : 'bg-white group-hover:bg-blue-50'
              "
            >
              <CheckCircle2 :size="28" />
            </div>
            <span class="text-sm uppercase tracking-widest">Terminé</span>
          </button>
        </div>
      </div>

      <!-- Section Finance -->
      <div class="bg-white p-4 md:p-8 rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <h3 class="font-black text-slate-800 text-xl flex items-center gap-3">
            <span class="w-1.5 h-6 bg-orange-500 rounded-full"></span>
            Finances de la Campagne
          </h3>
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex-1 md:flex-none px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 min-w-[140px]">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Rentabilité (ROI)</span>
              <span :class="['text-base font-black', campaignStats.balance >= 0 ? 'text-green-600' : 'text-red-600']">
                {{ formatCurrency(campaignStats.balance) }}
              </span>
            </div>
            <button 
              @click="router.push('/finance')"
              class="flex-1 md:flex-none bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
            >
              <Plus :size="16" />
              Ajouter
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div class="bg-green-50/50 p-6 rounded-3xl border border-green-100 flex items-center gap-5">
            <div class="p-4 bg-white text-green-600 rounded-2xl shadow-sm"><TrendingUp :size="24" /></div>
            <div>
              <p class="text-[10px] font-black text-green-700/50 uppercase tracking-widest">Recettes</p>
              <p class="text-xl font-black text-green-700">{{ formatCurrency(campaignStats.recettes) }}</p>
            </div>
          </div>
          <div class="bg-red-50/50 p-6 rounded-3xl border border-red-100 flex items-center gap-5">
            <div class="p-4 bg-white text-red-600 rounded-2xl shadow-sm"><TrendingDown :size="24" /></div>
            <div>
              <p class="text-[10px] font-black text-red-700/50 uppercase tracking-widest">Dépenses</p>
              <p class="text-xl font-black text-red-700">{{ formatCurrency(campaignStats.dépenses) }}</p>
            </div>
          </div>
          <div class="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex items-center gap-5">
            <div class="p-4 bg-white text-blue-600 rounded-2xl shadow-sm"><PieChart :size="24" /></div>
            <div>
              <p class="text-[10px] font-black text-blue-700/50 uppercase tracking-widest">Opérations</p>
              <p class="text-xl font-black text-blue-700">{{ campaignTransactions.length }}</p>
            </div>
          </div>
        </div>

        <!-- Table View (Desktop) -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                <th class="pb-5 px-4">Date</th>
                <th class="pb-5 px-4">Catégorie</th>
                <th class="pb-5 px-4">Description</th>
                <th class="pb-5 px-4 text-right">Montant</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 font-medium">
              <tr v-for="t in campaignTransactions" :key="t._id" class="text-sm hover:bg-slate-50 transition-colors">
                <td class="py-5 px-4 text-slate-500 font-bold">{{ new Date(t.date).toLocaleDateString('fr-FR') }}</td>
                <td class="py-5 px-4">
                  <span class="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider">
                    {{ t.category }}
                  </span>
                </td>
                <td class="py-5 px-4 text-slate-700 font-black">{{ t.description || '-' }}</td>
                <td class="py-5 px-4 text-right font-black" :class="t.type === 'recette' ? 'text-green-600' : 'text-red-600'">
                  {{ t.type === 'recette' ? '+' : '-' }} {{ formatCurrency(t.amount) }}
                </td>
              </tr>
              <tr v-if="campaignTransactions.length === 0">
                <td colspan="4" class="py-16 text-center text-slate-300 italic text-sm font-bold uppercase tracking-widest">
                  Aucun mouvement financier enregistré
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Transactions List -->
        <div class="md:hidden space-y-4">
          <div v-for="t in campaignTransactions" :key="t._id" class="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ new Date(t.date).toLocaleDateString('fr-FR') }}</p>
              <p class="font-black text-slate-800 text-sm">{{ t.description || t.category }}</p>
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider">{{ t.category }}</span>
            </div>
            <div class="text-right">
              <p :class="['font-black text-sm', t.type === 'recette' ? 'text-green-600' : 'text-red-600']">
                {{ t.type === 'recette' ? '+' : '-' }} {{ formatCurrency(t.amount) }}
              </p>
            </div>
          </div>
          <div v-if="campaignTransactions.length === 0" class="py-12 text-center text-slate-300 text-xs font-black uppercase tracking-widest">
            Aucun mouvement
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-else class="flex flex-col items-center justify-center py-32 space-y-6">
      <div class="animate-spin rounded-full h-16 w-12 border-4 border-slate-200 border-b-orange-500"></div>
      <p class="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Chargement des données...</p>
    </div>
  </div>
</template>

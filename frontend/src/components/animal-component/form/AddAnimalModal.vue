<script setup>
import { ref, onMounted } from "vue";
import { getCampaigns } from "@/services/campaignService";

const emit = defineEmits(["close", "created"]);

const code = ref("");
const species = ref("volaille");
const birthDate = ref("");
const campaign = ref("");

const campaigns = ref([]);

onMounted(async () => {
  campaigns.value = await getCampaigns();
});

const submit = () => {
  if (!code.value || !campaign.value || !birthDate.value) return;

  emit("created", {
    code: code.value,
    species: species.value,
    birthDate: birthDate.value,
    campaign: campaign.value
  });

  // reset
  code.value = "";
  birthDate.value = "";
  campaign.value = "";
};
</script>

<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

    <div class="bg-white w-[420px] rounded-2xl shadow-xl p-6 animate-fade-in">

      <!-- HEADER -->
      <h2 class="text-xl font-semibold text-slate-800 mb-6">
        Ajouter un animal
      </h2>

      <!-- FORM -->
      <div class="space-y-4">

        <!-- CODE -->
        <div>
          <label class="text-sm text-slate-500">Code</label>
          <input
            v-model="code"
            placeholder="POULET-001"
            class="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition"
          />
        </div>

        <!-- SPECIES -->
        <div>
          <label class="text-sm text-slate-500">Espèce</label>
          <select
            v-model="species"
            class="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition"
          >
            <option value="volaille">Volaille</option>
            <option value="betail">Bétail</option>
            <option value="poisson">Poisson</option>
          </select>
        </div>

        <!-- DATE -->
        <div>
          <label class="text-sm text-slate-500">Date de naissance</label>
          <input
            type="date"
            v-model="birthDate"
            class="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition"
          />
        </div>

        <!-- CAMPAIGN -->
        <div>
          <label class="text-sm text-slate-500">Campagne</label>
          <select
            v-model="campaign"
            class="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition"
          >
            <option disabled value="">Choisir une campagne</option>
            <option
              v-for="c in campaigns"
              :key="c._id"
              :value="c._id"
            >
              {{ c.name }}
            </option>
          </select>
        </div>

      </div>

      <!-- ACTIONS -->
      <div class="flex justify-end gap-3 mt-6">

        <button
          @click="$emit('close')"
          class="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
        >
          Annuler
        </button>

        <button
          @click="submit"
          class="px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition shadow"
        >
          Créer
        </button>

      </div>

    </div>
  </div>
</template>
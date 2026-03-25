<script setup>
import { getCampaigns } from "@/services/campaignService";
import { getDepartments } from "@/services/departmentService";
import { ref, onMounted } from "vue";


const emit = defineEmits(["close", "created"]);

const code = ref("");
// const species = ref("volaille");
const birthDate = ref("");
const loading = ref(true);
const error = ref("");
const campaign = ref("");
const department = ref("");

const campaigns = ref([]);
const departments = ref([]);

const fetchCampaigns = async () => {
  try {
    const res = await getCampaigns();
    campaigns.value = res.data;
    console.log(campaigns.value);

  } catch (err) {
    console.error("Erreur chargement campagnes", err);
  } finally {
    loading.value = false;
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    const [deptRes] = await Promise.all([
      getDepartments(),
    ]);
    departments.value = deptRes.data;
    console.log(departments.value);

  } catch (err) {
    error.value = "Erreur lors du chargement des données";
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchCampaigns();
  await fetchData();
});

const submit = () => {
  if (!code.value || !campaign.value || !birthDate.value) return;

  emit("created", {
    code: code.value,
    department: department.value,
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
          <input v-model="code" placeholder="POULET-001"
            class="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition" />
        </div>

        <!-- SPECIES -->
        <div>
          <label class="text-sm text-slate-500">Départements</label>
          <select v-model="department"
            class="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition">
            <option disabled value="">Choisir un département</option>
            <option v-for="d in departments" :key="d._id" :value="d._id">
              {{ d.name }}
            </option>
          </select>
        </div>

        <!-- DATE -->
        <div>
          <label class="text-sm text-slate-500">Date de naissance</label>
          <input type="date" v-model="birthDate"
            class="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition" />
        </div>

        <!-- CAMPAIGN -->
        <div>
          <label class="text-sm text-slate-500">Campagne</label>
          <select v-model="campaign"
            class="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition">
            <option disabled value="">Choisir une campagne</option>
            <option v-for="c in campaigns" :key="c._id" :value="c._id">
              {{ c.name }}
            </option>
          </select>
        </div>

      </div>

      <!-- ACTIONS -->
      <div class="flex justify-end gap-3 mt-6">

        <button @click="$emit('close')"
          class="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition">
          Annuler
        </button>

        <button @click="submit"
          class="px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition shadow">
          Créer
        </button>

      </div>

    </div>
  </div>
</template>
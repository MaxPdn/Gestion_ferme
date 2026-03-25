<script setup>
import { ref } from "vue";

const emit = defineEmits(["close", "save"]);

const type = ref("vaccin");
const description = ref("");
const loading = ref(false);

const submit = () => {
  if (!type.value) return;

  loading.value = true;

  emit("save", {
    type: type.value,
    description: description.value?.trim() || ""
  });

  // reset propre
  type.value = "vaccin";
  description.value = "";
  loading.value = false;
};
</script>

<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

    <div class="bg-white p-6 rounded-2xl w-96 shadow-xl animate-fade-in">

      <h3 class="text-lg font-semibold text-slate-800 mb-5">
        Ajouter un événement santé
      </h3>

      <div class="space-y-4">

        <!-- TYPE -->
        <div>
          <label class="text-sm text-slate-500">Type</label>
          <select
            v-model="type"
            class="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none"
          >
            <option value="vaccin">Vaccin</option>
            <option value="maladie">Maladie</option>
            <option value="traitement">Traitement</option>
          </select>
        </div>

        <!-- DESCRIPTION -->
        <div>
          <label class="text-sm text-slate-500">Description</label>
          <input
            v-model="description"
            placeholder="Ex: vaccin grippe"
            class="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

      </div>

      <div class="flex justify-end gap-3 mt-6">

        <button
          @click="$emit('close')"
          class="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
        >
          Annuler
        </button>

        <button
          @click="submit"
          :disabled="loading"
          class="px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
        >
          Ajouter
        </button>

      </div>

    </div>
  </div>
</template>
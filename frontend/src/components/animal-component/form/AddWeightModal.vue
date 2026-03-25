<script setup>
import { ref } from "vue";

const emit = defineEmits(["close", "save"]);

const weight = ref("");
const error = ref("");
const loading = ref(false);

const submit = () => {
  const value = Number(weight.value);

  if (!value || value <= 0) {
    error.value = "Poids invalide";
    return;
  }

  error.value = "";
  loading.value = true;

  emit("save", value);

  weight.value = "";
  loading.value = false;
};
</script>

<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

    <div class="bg-white p-6 rounded-2xl w-80 shadow-xl animate-fade-in">

      <h3 class="text-lg font-semibold text-slate-800 mb-5">
        Ajouter un poids
      </h3>

      <div>
        <label class="text-sm text-slate-500">Poids (kg)</label>
        <input
          v-model="weight"
          type="number"
          step="0.1"
          placeholder="Ex: 1.5"
          class="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none"
        />

        <p v-if="error" class="text-red-500 text-xs mt-1">
          {{ error }}
        </p>
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
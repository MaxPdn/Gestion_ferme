<script setup>
import { ref } from "vue";

defineProps({ weights: Array });

const open = ref(false);
</script>

<template>
  <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
    
    <!-- HEADER -->
    <div
      class="flex justify-between items-center cursor-pointer"
      @click="open = !open"
    >
      <h3 class="font-semibold text-lg">Historique des poids</h3>

      <span class="text-sm text-slate-400 transition-all duration-300">
        {{ open ? "Fermer ▲" : "Voir plus ▼" }}
      </span>
    </div>

    <!-- EMPTY -->
    <div v-if="weights.length === 0" class="text-slate-400 text-sm mt-3">
      Aucun poids enregistré
    </div>

    <!-- LIST -->
    <div
      class="transition-all duration-300 overflow-hidden"
      :class="open ? 'max-h-[1000px] mt-4 opacity-100' : 'max-h-0 opacity-0'"
    >
      <ul class="space-y-3">
        
        <li
          v-for="(w, i) in weights"
          :key="i"
          class="flex justify-between items-center bg-gray-50 p-4 rounded-xl text-sm hover:bg-gray-100 transition"
        >
          <span class="font-medium">
            {{ w.value }} kg
          </span>

          <span class="text-slate-400 text-xs">
            {{ new Date(w.date).toLocaleDateString() }}
          </span>
        </li>

      </ul>
    </div>

  </div>
</template>
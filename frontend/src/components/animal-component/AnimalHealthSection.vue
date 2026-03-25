<script setup>
import { ref } from "vue";

defineProps({ history: Array });

const open = ref(false);
</script>

<template>
  <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
    
    <!-- HEADER -->
    <div
      class="flex justify-between items-center cursor-pointer"
      @click="open = !open"
    >
      <h3 class="font-semibold text-lg">Santé & traitements</h3>

      <span class="text-sm text-slate-400 transition-all duration-300">
        {{ open ? "Fermer ▲" : "Voir plus ▼" }}
      </span>
    </div>

    <!-- EMPTY -->
    <div v-if="history.length === 0" class="text-slate-400 text-sm mt-3">
      Aucun événement
    </div>

    <!-- LIST -->
    <div
      class="transition-all duration-300 overflow-hidden"
      :class="open ? 'max-h-[500px] mt-4 opacity-100' : 'max-h-0 opacity-0'"
    >
      <ul class="space-y-3">
        
        <li
          v-for="(event, i) in history"
          :key="i"
          class="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition"
        >
          <div class="flex justify-between items-center">
            <p class="font-medium capitalize">
              {{ event.type }}
            </p>

            <span class="text-xs text-slate-500">
              {{ new Date(event.date).toLocaleDateString() }}
            </span>
          </div>

          <p class="text-slate-400 text-sm mt-1">
            {{ event.description || "Aucune description" }}
          </p>
        </li>

      </ul>
    </div>

  </div>
</template>
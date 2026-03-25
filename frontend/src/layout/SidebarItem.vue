<script setup>
import { computed } from 'vue';

const props = defineProps({
  icon: [Object, Function], // On attend maintenant un composant Lucide
  label: String,
  active: Boolean,
});

const activeClasses = computed(() => 
  props.active 
    ? 'bg-orange-500/10 text-orange-500 border-r-4 border-orange-500 shadow-sm' 
    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white group'
);
</script>

<template>
  <div
    class="flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-all duration-300 ease-in-out"
    :class="activeClasses"
  >
    <component 
      :is="icon" 
      :size="20" 
      :stroke-width="2"
      class="transition-transform duration-300 group-hover:scale-110"
      :class="active ? 'text-orange-500' : 'text-slate-400 group-hover:text-white'"
    />
    <span class="text-[15px] font-medium tracking-wide">{{ label }}</span>
  </div>
</template>

<style scoped>
/* Optionnel: animation de pulsation légère pour l'élément actif */
.bg-orange-500\/10 {
  background-color: rgba(249, 115, 22, 0.1);
}
</style>

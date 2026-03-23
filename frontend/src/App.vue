<script setup>
import { message, show } from "./composables/useNotify.js";
</script>

<template>
  <router-view />
  
  <!-- notification toast -->
  <Transition name="fade">
    <div v-if="show" class="fixed bottom-5 right-5 z-50">
      <div class="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-blue-400/30 backdrop-blur-sm">
        <span class="text-sm font-medium">{{ message }}</span>
      </div>
    </div>
  </Transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>

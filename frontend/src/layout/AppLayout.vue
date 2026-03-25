<template>
  <div class="flex min-h-screen bg-slate-50">
    <!-- Sidebar -->
    <Sidebar :isOpen="isSidebarOpen" @close="isSidebarOpen = false" />

    <div class="flex-1 flex flex-col min-w-0">
      <!-- Header Mobile -->
      <header class="lg:hidden bg-[#1e293b] text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div class="flex items-center gap-3">
          <div class="bg-orange-500 p-1.5 rounded-lg">
            <Sprout :size="20" class="text-white" />
          </div>
          <span class="font-bold tracking-tight">TerraCore</span>
        </div>
        <button 
          @click="isSidebarOpen = true"
          class="p-2 hover:bg-slate-700 rounded-xl transition-colors"
        >
          <Menu :size="24" />
        </button>
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-x-hidden">
        <div class="max-w-full">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Sidebar from "./Sidebar.vue";
import { Sprout, Menu } from "lucide-vue-next";

const isSidebarOpen = ref(false);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

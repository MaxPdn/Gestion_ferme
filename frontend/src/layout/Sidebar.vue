<script setup>
import { ref } from 'vue';
import SidebarItem from "./SidebarItem.vue";
import { 
  LayoutDashboard, 
  Sprout, 
  User, 
  HeartPulse, 
  Utensils, 
  BadgeDollarSign, 
  Package, 
  Bell, 
  Users,
  ChevronLeft,
  ChevronRight,
  Settings
} from 'lucide-vue-next';

const isCollapsed = ref(false);
const activeItem = ref("Financier");

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const selectItem = (label) => {
  activeItem.value = label;
};

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Sprout, label: "Campagnes" },
  { icon: User, label: "Suivi Individuel" },
  { icon: HeartPulse, label: "Santé" },
  { icon: Utensils, label: "Alimentation" },
  { icon: BadgeDollarSign, label: "Financier" },
  { icon: Package, label: "Stocks" },
  { icon: Bell, label: "Alertes" },
  { icon: Users, label: "Utilisateurs" },
];
</script>

<template>
  <aside
    :class="[
      'h-screen bg-[#1e293b] text-white flex flex-col transition-all duration-300 ease-in-out border-r border-slate-700/50',
      isCollapsed ? 'w-20' : 'w-72'
    ]"
  >
    <!-- LOGO SECTION -->
    <div class="flex items-center gap-4 px-6 py-8">
      <div class="flex-shrink-0 bg-gradient-to-br from-orange-400 to-orange-600 p-2.5 rounded-2xl shadow-lg shadow-orange-500/20">
        <Sprout :size="24" class="text-white" />
      </div>
      <div v-if="!isCollapsed" class="overflow-hidden transition-all duration-300">
        <h1 class="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          TerraCore
        </h1>
        <p class="text-[10px] uppercase tracking-[0.2em] text-orange-500 font-bold">Gestion Ferme</p>
      </div>
    </div>

    <!-- NAVIGATION -->
    <nav class="flex-1 mt-2 overflow-y-auto custom-scrollbar">
      <div class="space-y-1">
        <SidebarItem 
          v-for="(item, index) in menuItems" 
          :key="index"
          :icon="item.icon" 
          :label="isCollapsed ? '' : item.label" 
          :active="activeItem === item.label"
          @click="selectItem(item.label)"
          class="relative"
        />
      </div>
    </nav>

    <!-- FOOTER / SETTINGS -->
    <div class="mt-auto border-t border-slate-700/50 p-4">
      <div class="space-y-2">
        <SidebarItem 
          :icon="Settings" 
          :label="isCollapsed ? '' : 'Paramètres'" 
          class="opacity-60 hover:opacity-100 transition-opacity"
        />
        
        <button
          @click="toggleSidebar"
          class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
        >
          <component :is="isCollapsed ? ChevronRight : ChevronLeft" :size="20" />
          <span v-if="!isCollapsed" class="text-sm font-medium">Réduire le menu</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
</style>

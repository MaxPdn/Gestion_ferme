<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import SidebarItem from "../layout/SidebarItem.vue";

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
  Settings,
} from "lucide-vue-next";

const router = useRouter();

const isCollapsed = ref(false);

// 🔥 mapping label → route
const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Sprout, label: "Campagnes", path: "/" },
  { icon: User, label: "Suivi Individuel", path: "/individual" },
  { icon: HeartPulse, label: "Santé", path: "/health" },
  { icon: Utensils, label: "Alimentation", path: "/feed" },
  { icon: BadgeDollarSign, label: "Financier", path: "/finance" },
  { icon: Package, label: "Stocks", path: "/stock" },
  { icon: Bell, label: "Alertes", path: "/alerts" },
  { icon: Users, label: "Utilisateurs", path: "/users" },
];

const activeItem = ref("Campagnes");

// 🔁 navigation réelle
const selectItem = (item) => {
  activeItem.value = item.label;
  router.push(item.path);
};

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    
    <!-- 🧭 SIDEBAR -->
    <aside
      :class="[
        'h-full bg-[#1e293b] text-white flex flex-col transition-all duration-300 border-r border-slate-700/50',
        isCollapsed ? 'w-20' : 'w-72'
      ]"
    >
      <!-- LOGO -->
      <div class="flex items-center gap-4 px-6 py-8">
        <div class="bg-gradient-to-br from-orange-400 to-orange-600 p-2.5 rounded-2xl">
          <Sprout :size="24" />
        </div>

        <div v-if="!isCollapsed">
          <h1 class="text-xl font-bold">TerraCore</h1>
          <p class="text-xs text-orange-400">Gestion Ferme</p>
        </div>
      </div>

      <!-- NAV -->
      <nav class="flex-1 mt-2 overflow-y-auto">
        <SidebarItem
          v-for="(item, index) in menuItems"
          :key="index"
          :icon="item.icon"
          :label="isCollapsed ? '' : item.label"
          :active="activeItem === item.label"
          @click="selectItem(item)"
        />
      </nav>

      <!-- FOOTER -->
      <div class="mt-auto p-4 border-t border-slate-700/50">
        <SidebarItem
          :icon="Settings"
          :label="isCollapsed ? '' : 'Paramètres'"
        />

        <button
          @click="toggleSidebar"
          class="w-full flex items-center justify-center mt-3 p-2 bg-slate-700 rounded"
        >
          <component :is="isCollapsed ? ChevronRight : ChevronLeft" />
        </button>
      </div>
    </aside>

    <!-- 📄 CONTENU -->
    <main class="flex-1 overflow-y-auto p-6">
      <!-- <router-view /> -->
    </main>

  </div>
</template>
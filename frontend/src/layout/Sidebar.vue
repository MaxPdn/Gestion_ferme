<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import SidebarItem from "./SidebarItem.vue";
import {
  LayoutDashboard,
  Layers,
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
  LogOut,
  X
} from "lucide-vue-next";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const router = useRouter();
const isCollapsed = ref(false);
const user = JSON.parse(localStorage.getItem("user") || "{}");

// 🔥 mapping label → route
const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/home" },
  { icon: Layers, label: "Departements", path: "/departements" },
  { icon: Sprout, label: "Campagnes", path: "/campaigns" },
  { icon: Utensils, label: "Alimentation", path: "/alimentation" },
  { icon: User, label: "Suivi Individuel",path:"/animals" },
  { icon: HeartPulse, label: "Santé", path: "/sante" },
  {
    icon: BadgeDollarSign,
    label: "Financier",
    path: "/finance",
    roles: ["Admin", "Gestionnaire"],
  },
  { icon: Package, label: "Stocks", path: "/stocks" },
  { icon: Bell, label: "Alertes", path: "/alerts" },
  { icon: Users, label: "Utilisateurs", path: "/home/users", role: "Admin" },
].filter((item) => {
  if (item.roles) return item.roles.includes(user.role);
  if (item.role) return item.role === user.role;
  return true;
});
const activeItem = ref("Dashboard");


const selectItem = (item) => {
  activeItem.value = item.label;
  if (item.path) {
    router.push(item.path);
    emit('close'); // Fermer le menu mobile après navigation
  }
};


const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  router.push("/");
};
</script>

<template>
  <!-- Overlay pour mobile -->
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
    @click="emit('close')"
  ></div>

  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 lg:static flex flex-col bg-[#1e293b] text-white transition-all duration-300 ease-in-out border-r border-slate-700/50',
      isCollapsed ? 'lg:w-20' : 'lg:w-72',
      isOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <!-- LOGO SECTION -->
    <div class="flex items-center justify-between px-6 py-8">
      <div class="flex items-center gap-4">
        <div
          class="flex-shrink-0 bg-gradient-to-br from-orange-400 to-orange-600 p-2.5 rounded-2xl shadow-lg shadow-orange-500/20"
        >
          <Sprout :size="24" class="text-white" />
        </div>
        <div
          v-if="!isCollapsed || isOpen"
          class="overflow-hidden transition-all duration-300"
        >
          <h1
            class="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400"
          >
            TerraCore
          </h1>
          <p
            class="text-[10px] uppercase tracking-[0.2em] text-orange-500 font-bold"
          >
            Gestion Ferme
          </p>
        </div>
      </div>
      <!-- Bouton fermer pour mobile -->
      <button @click="emit('close')" class="lg:hidden p-2 text-slate-400 hover:text-white">
        <X :size="24" />
      </button>
    </div>

    <!-- NAVIGATION -->
    <nav class="flex-1 mt-2 overflow-y-auto custom-scrollbar">
      <div class="space-y-1">
        <SidebarItem
          v-for="(item, index) in menuItems"
          :key="index"
          :icon="item.icon"
          :label="(isCollapsed && !isOpen) ? '' : item.label"
          :active="activeItem === item.label"
          @click="selectItem(item)"
          class="relative"
        />
      </div>
    </nav>

    <!-- FOOTER / SETTINGS -->
    <div class="mt-auto border-t border-slate-700/50 p-4">
      <div class="space-y-2">
        <div
          v-if="!isCollapsed || isOpen"
          class="px-4 py-2 mb-2 bg-slate-800/30 rounded-xl"
        >
          <p class="text-xs text-slate-400">Connecté en tant que</p>
          <p class="text-sm font-bold text-white truncate">
            {{ user.username }}
          </p>
          <p
            class="text-[10px] text-orange-500 font-bold uppercase tracking-wider"
          >
            {{ user.role }}
          </p>
        </div>

        <SidebarItem
          :icon="Settings"
          :label="(isCollapsed && !isOpen) ? '' : 'Paramètres'"
          class="opacity-60 hover:opacity-100 transition-opacity"
        />

        <button
          @click="logout"
          class="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group"
        >
          <LogOut
            :size="20"
            class="group-hover:translate-x-1 transition-transform"
          />
          <span v-if="!isCollapsed || isOpen" class="text-sm font-medium"
            >Déconnexion</span
          >
        </button>

        <button
          @click="toggleSidebar"
          class="hidden lg:flex w-full items-center justify-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-700 transition-colors text-slate-400 hover:text-white mt-4"
        >
          <component
            :is="isCollapsed ? ChevronRight : ChevronLeft"
            :size="20"
          />
          <span v-if="!isCollapsed" class="text-sm font-medium"
            >Réduire le menu</span
          >
        </button>
      </div>
    </div>
  </aside>
</template>

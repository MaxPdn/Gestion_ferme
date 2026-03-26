import { createRouter, createWebHistory } from 'vue-router'
import AnimalListView from '@/views/AnimalListView.vue'
import AnimalView from '@/views/AnimalView.vue'
import CampaignList from "../views/CampaignList.vue";
import CampaignCreate from "../views/CampaignCreate.vue";
import CampaignDetail from "../views/CampaignDetail.vue";
import Departements from "@/views/Departements.vue";
import Alert from "@/views/Alert.vue";
import Alimentation from "@/views/Alimentation.vue";
import Stock from "@/views/Stock.vue";
import HealthView from "../views/HealthView.vue";
import FinanceView from "../views/FinanceView.vue";

import Login from "../views/Login.vue";
import Home from "../views/Home.vue";
import Users from "../views/Users.vue";
import AppLayout from "../layout/AppLayout.vue";

const routes = [
  { path: "/", component: Login },
  {
    path: "/home",
    component: AppLayout,
    children: [
      { path: "campaigns", component: CampaignList },
      { path: "create", component: CampaignCreate },
      { path: "campaign/:id", component: CampaignDetail },
      { path: "departements", component: Departements },
      { path: "alerts", component: Alert },
      { path: "alimentation", component: Alimentation },
      { path: "stocks", component: Stock },
      { path: "sante", component: HealthView },
      { path: "finance", component: FinanceView },
      { path: "", component: Home },
      {
        path: "users",
        component: Users,
        beforeEnter: (to, from) => {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          if (user.role === "Admin") {
            return true;
          } else {
            return "/home";
          }
        },
      },
      {
        path: "animals",
        component: AnimalListView
      },
      {
        path: 'animal/:id',
        name: 'animal',
        component: AnimalView
      }
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// protection route globale
router.beforeEach((to, from) => {
  const token = localStorage.getItem("token");

  if (to.path !== "/" && !token) {
    return "/";
  } else if (to.path === "/" && token) {
    return "/home";
  }
});

export default router;

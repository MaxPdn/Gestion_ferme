import { createRouter, createWebHistory } from "vue-router";

import CampaignList from "../views/CampaignList.vue";
import CampaignCreate from "../views/CampaignCreate.vue";
import CampaignDetail from "../views/CampaignDetail.vue";
import Departements from "@/views/Departements.vue";
import Alert from "@/views/Alert.vue";
import HealthView from "../views/HealthView.vue";

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
      { path: "/campaigns", component: CampaignList },
      { path: "/create", component: CampaignCreate },
      { path: "/campaign/:id", component: CampaignDetail },
      { path: "/departements", component: Departements },
      { path: "/alerts", component: Alert },
      { path: "/sante", component: HealthView },
      { path: "", component: Home },
      {
        path: "users",
        component: Users,
        beforeEnter: (to, from, next) => {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          if (user.role === "Admin") {
            next();
          } else {
            next("/home");
          }
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// protection route globale
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  if (to.path !== "/" && !token) {
    next("/");
  } else if (to.path === "/" && token) {
    next("/home");
  } else {
    next();
  }
});

export default router;

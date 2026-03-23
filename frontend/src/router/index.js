import { createRouter, createWebHistory } from "vue-router";

import CampaignList from "../views/CampaignList.vue";
import CampaignCreate from "../views/CampaignCreate.vue";
import CampaignDetail from "../views/CampaignDetail.vue";
import Departements from "@/views/Departements.vue";

const routes = [
  { path: "/", component: CampaignList },
  { path: "/create", component: CampaignCreate },
  { path: "/campaign/:id", component: CampaignDetail },
  { path: "/departements", component: Departements },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
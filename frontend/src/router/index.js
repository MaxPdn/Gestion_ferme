import { createRouter, createWebHistory } from "vue-router";

import CampaignList from "../pages/CampaignList.vue";
import CampaignCreate from "../pages/CampaignCreate.vue";
import CampaignDetail from "../pages/CampaignDetail.vue";

const routes = [
  { path: "/", component: CampaignList },
  { path: "/create", component: CampaignCreate },
  { path: "/campaign/:id", component: CampaignDetail },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
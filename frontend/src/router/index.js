import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Home from "../views/Home.vue";

const routes = [
  { path: "/", component: Login },
  { path: "/register", component: Register },
  { path: "/home", component: Home }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// protection route home
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  if (to.path === "/home" && !token)
    next("/");
  else
    next();
});

export default router;
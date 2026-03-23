import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Home from "../views/Home.vue";
import AppLayout from "../layout/AppLayout.vue";

const routes = [
  { path: "/", component: Login },
  { path: "/register", component: Register },
  {
    path: "/home",
    component: AppLayout,
    children: [
      { path: "", component: Home }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// protection route home
router.beforeEach((to) => {
  const token = localStorage.getItem("token");

  if (to.path === "/home" && !token){
    return("/");
  }

});

export default router;
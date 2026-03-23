import { createRouter, createWebHistory } from "vue-router";
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
        }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
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
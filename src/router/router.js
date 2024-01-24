import { createRouter, createWebHistory } from "vue-router";
import DefaultLayouts from "@/layouts/DefaultLayouts.vue";
import AuthLayouts from "@/layouts/AuthLayouts.vue";

function lazyLoad(view) {
  return () => import(`@/views/${view}.vue`);
}

const routes = [
  {
    name: "Home",
    path: "/",
    redirect: "/company"
  },
  {
    name: "Auth",
    path: "/auth",
    component: lazyLoad("auth"),
    meta: {
      layout: AuthLayouts,
    },
  },
  {
    name: "Company",
    path: "/company",
    component: lazyLoad("company"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      role: "superadmin",
    },
    beforeEnter: (to, from, next) => {
      const role = localStorage.getItem("role");

      if (to.meta.role !== role) {
        next({ name: "Auth" });
        return;
      }

      next();
    },
  },
  {
    name: "Employees",
    path: "/employees",
    component: lazyLoad("employees"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      role: "superadmin",
    },
    beforeEnter: (to, from, next) => {
      const role = localStorage.getItem("role");

      if (to.meta.role !== role) {
        next({ name: "Auth" });
        return;
      }

      next();
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes,
});

export default router;

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
    redirect: to => {
      const roleId = localStorage.getItem("roleId");

      if (roleId === '1') {
        return { path: "/companies" }
      }

      return { path: "/objects" }
    },
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
    name: "Companies",
    path: "/companies",
    component: lazyLoad("companies"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "1",
    }
  },
  {
    name: "Employees",
    path: "/employees",
    component: lazyLoad("employees"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "1",
    }
  },
  {
    name: "Objects",
    path: "/objects",
    component: lazyLoad("objects"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "2",
    }
  },
  {
    name: "Blocks",
    path: "/blocks",
    component: lazyLoad("blocks"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "2",
    }
  },
  {
    name: "Smeta",
    path: "/smeta",
    component: lazyLoad("smeta"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "2",
    }
  },
  {
    name: "Roles",
    path: "/roles",
    component: lazyLoad("roles"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "2",
    }
  },
  {
    name: "Organization-employees",
    path: "/organization-employees",
    component: lazyLoad("organization-employees"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "2",
    }
  },
  {
    name: "Expenses",
    path: "/expenses",
    component: lazyLoad("expenses"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "2",
    }
  },
  {
    name: "Warehouse",
    path: "/warehouse",
    component: lazyLoad("warehouse"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "2",
    }
  },
  {
    name: "Products",
    path: "/products",
    component: lazyLoad("products"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "2",
    }
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const roleId = localStorage.getItem("roleId");

  if (!roleId) {
    next();
    return;
  }

  if (to?.name !== "Auth" && to?.meta?.roleId !== roleId) {
    next({ name: "Home" });
    return;
  }

  next();
});

export default router;

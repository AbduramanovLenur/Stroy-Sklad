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
      const role = localStorage.getItem("role");

      if (role === 'superadmin') {
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
      role: "superadmin",
    },
    // beforeEnter: (to, from, next) => {
    //   const role = localStorage.getItem("role");

    //   if (to.meta.role !== role) {
    //     next({ name: "Auth" });
    //     return;
    //   }

    //   next();
    // },
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
    // beforeEnter: (to, from, next) => {
    //   const role = localStorage.getItem("role");

    //   if (to.meta.role !== role) {
    //     next({ name: "Auth" });
    //     return;
    //   }

    //   next();
    // },
  },
  {
    name: "Objects",
    path: "/objects",
    component: lazyLoad("objects"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      role: "orgadmin",
    },
    // beforeEnter: (to, from, next) => {
    //   const role = localStorage.getItem("role");

    //   if (to.meta.role !== role) {
    //     next({ name: "Auth" });
    //     return;
    //   }

    //   next();
    // },
  },
  {
    name: "Blocks",
    path: "/blocks",
    component: lazyLoad("blocks"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      role: "orgadmin",
    },
    // beforeEnter: (to, from, next) => {
    //   const role = localStorage.getItem("role");

    //   if (to.meta.role !== role) {
    //     next({ name: "Auth" });
    //     return;
    //   }

    //   next();
    // },
  },
  {
    name: "Smeta",
    path: "/smeta",
    component: lazyLoad("smeta"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      role: "orgadmin",
    },
    // beforeEnter: (to, from, next) => {
    //   const role = localStorage.getItem("role");

    //   if (to.meta.role !== role) {
    //     next({ name: "Auth" });
    //     return;
    //   }

    //   next();
    // },
  },
  {
    name: "Roles",
    path: "/roles",
    component: lazyLoad("roles"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      role: "orgadmin",
    },
    // beforeEnter: (to, from, next) => {
    //   const role = localStorage.getItem("role");

    //   if (to.meta.role !== role) {
    //     next({ name: "Auth" });
    //     return;
    //   }

    //   next();
    // },
  },
  {
    name: "Organization-employees",
    path: "/organization-employees",
    component: lazyLoad("organization-employees"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      role: "orgadmin",
    },
    // beforeEnter: (to, from, next) => {
    //   const role = localStorage.getItem("role");

    //   if (to.meta.role !== role) {
    //     next({ name: "Auth" });
    //     return;
    //   }

    //   next();
    // },
  },
  {
    name: "Expenses",
    path: "/expenses",
    component: lazyLoad("expenses"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      role: "orgadmin",
    },
    // beforeEnter: (to, from, next) => {
    //   const role = localStorage.getItem("role");

    //   if (to.meta.role !== role) {
    //     next({ name: "Auth" });
    //     return;
    //   }

    //   next();
    // },
  },
  {
    name: "Warehouse",
    path: "/warehouse",
    component: lazyLoad("warehouse"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      role: "orgadmin",
    },
    // beforeEnter: (to, from, next) => {
    //   const role = localStorage.getItem("role");

    //   if (to.meta.role !== role) {
    //     next({ name: "Auth" });
    //     return;
    //   }

    //   next();
    // },
  },
  {
    name: "Products",
    path: "/products",
    component: lazyLoad("products"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      role: "orgadmin",
    },
    // beforeEnter: (to, from, next) => {
    //   const role = localStorage.getItem("role");

    //   if (to.meta.role !== role) {
    //     next({ name: "Auth" });
    //     return;
    //   }

    //   next();
    // },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const role = localStorage.getItem("role");

  if (to?.name !== "Auth" && to?.meta?.role !== role) {
    next({ name: "Home" });
    return;
  }

  next();
})

export default router;

import { createRouter, createWebHistory } from "vue-router";
import { routes as routesList } from "@/utils/routes.js";
import DefaultLayouts from "@/layouts/DefaultLayouts.vue";
import AuthLayouts from "@/layouts/AuthLayouts.vue";

const routes = [
  {
    name: routesList.HOME.name,
    path: routesList.HOME.path,
    redirect: to => {
      const roleId = localStorage.getItem("roleId");

      if (roleId === '1') {
        return { path: "/companies" }
      }

      return { path: "/objects" }
    },
  },
  {
    name: routesList.AUTH.name,
    path: routesList.AUTH.path,
    component: () => import("@/views/auth.vue"),
    meta: {
      layout: AuthLayouts,
    },
  },
  {
    name: routesList.COMPANIES.name,
    path: routesList.COMPANIES.path,
    component: () => import("@/views/companies/index.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "1",
    },
  },
  {
    name: routesList.CREATE_COMPANIES.name,
    path: routesList.CREATE_COMPANIES.path,
    component: () => import("@/views/companies/create.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "1",
    },
  },
  {
    name: routesList.UPDATE_COMPANIES.name,
    path: routesList.UPDATE_COMPANIES.path,
    component: () => import("@/views/companies/update.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "1",
    },
  },
  {
    name: routesList.EMPLOYEES.name,
    path: routesList.EMPLOYEES.path,
    component: () => import("@/views/employees/index.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "1",
    }
  },
  {
    name: routesList.CREATE_EMPLOYEES.name,
    path: routesList.CREATE_EMPLOYEES.path,
    component: () => import("@/views/employees/create.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "1",
    },
  },
  {
    name: routesList.UPDATE_EMPLOYEES.name,
    path: routesList.UPDATE_EMPLOYEES.path,
    component: () => import("@/views/employees/update.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "1",
    },
  },
  {
    name: routesList.OBJECTS.name,
    path: routesList.OBJECTS.path,
    component: () => import("@/views/objects/index.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "2",
    }
  },
  {
    name: routesList.CREATE_OBJECTS.name,
    path: routesList.CREATE_OBJECTS.path,
    component: () => import("@/views/objects/create.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "2",
    },
  },
  {
    name: routesList.UPDATE_OBJECTS.name,
    path: routesList.UPDATE_OBJECTS.path,
    component: () => import("@/views/objects/update.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "2",
    },
  },
  {
    name: routesList.BLOCKS.name,
    path: routesList.BLOCKS.path,
    component: () => import("@/views/blocks/index.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "2",
    }
  },
  {
    name: routesList.CREATE_BLOCKS.name,
    path: routesList.CREATE_BLOCKS.path,
    component: () => import("@/views/blocks/create.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "2",
    },
  },
  {
    name: routesList.UPDATE_BLOCKS.name,
    path: routesList.UPDATE_BLOCKS.path,
    component: () => import("@/views/blocks/update.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "2",
    },
  },
  // {
  //   name: "Smeta",
  //   path: "/smeta",
  //   component: () => import("@/views/smeta.vue"),
  //   meta: {
  //     layout: DefaultLayouts,
  //     requiresAuth: true,
  //     roleId: "2",
  //   }
  // },
  // {
  //   name: "Roles",
  //   path: "/roles",
  //   component: () => import("@/views/roles.vue"),
  //   meta: {
  //     layout: DefaultLayouts,
  //     requiresAuth: true,
  //     roleId: "2",
  //   }
  // },
  // {
  //   name: "Organization-employees",
  //   path: "/organization-employees",
  //   component: () => import("@/views/organization-employees.vue"),
  //   meta: {
  //     layout: DefaultLayouts,
  //     requiresAuth: true,
  //     roleId: "2",
  //   }
  // },
  // {
  //   name: "Expenses",
  //   path: "/expenses",
  //   component: () => import("@/views/expenses.vue"),
  //   meta: {
  //     layout: DefaultLayouts,
  //     requiresAuth: true,
  //     roleId: "2",
  //   }
  // },
  // {
  //   name: "Warehouse",
  //   path: "/warehouse",
  //   component: () => import("@/views/warehouse.vue"),
  //   meta: {
  //     layout: DefaultLayouts,
  //     requiresAuth: true,
  //     roleId: "2",
  //   }
  // },
  {
    name: routesList.PRODUCTS.name,
    path: routesList.PRODUCTS.path,
    component: () => import("@/views/products/index.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: "2",
    }
  },
  // {
  //   name: routesList.CREATE_PRODUCTS.name,
  //   path: routesList.CREATE_PRODUCTS.path,
  //   component: () => import("@/views/products/create.vue"),
  //   meta: {
  //     layout: DefaultLayouts,
  //     requiresAuth: true,
  //     roleId: "2",
  //   }
  // },
  // {
  //   name: routesList.UPDATE_PRODUCTS.name,
  //   path: routesList.UPDATE_PRODUCTS.path,
  //   component: () => import("@/views/products/update.vue"),
  //   meta: {
  //     layout: DefaultLayouts,
  //     requiresAuth: true,
  //     roleId: "2",
  //   }
  // },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes,

});

router.beforeEach((to, from, next) => {
  const roleId = localStorage.getItem("roleId");
  const token = localStorage.getItem("token");

  if (to?.name !== routesList.AUTH.name && !token) {
    next({ name: routesList.AUTH.name });
    return;
  }

  if (!roleId) {
    next();
    return;
  }

  if (to?.name !== routesList.AUTH.name && to?.meta?.roleId !== roleId) {
    next({ name: routesList.HOME.name });
    return;
  }

  next();
});

export default router;

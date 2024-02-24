import { createRouter, createWebHistory } from "vue-router";
import { routes as routesList } from "@/utils/routes.js";
import { roles } from "@/utils/roles.js";
import { useUserStore } from "@/store/userStore";
import { storeToRefs } from "pinia";
import DefaultLayouts from "@/layouts/DefaultLayouts.vue";
import AuthLayouts from "@/layouts/AuthLayouts.vue";

const routes = [
  {
    name: routesList.HOME.name,
    path: routesList.HOME.path,
    redirect: to => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (+user.value?.user?.roleId === +roles.SUPERADMIN_ID) {
        return { path: routesList.COMPANIES.path }
      }

      return { path: routesList.ROLES.path }
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
      roleId: roles.SUPERADMIN_ID,
    },
  },
  {
    name: routesList.CREATE_COMPANIES.name,
    path: routesList.CREATE_COMPANIES.path,
    component: () => import("@/views/companies/create.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.SUPERADMIN_ID,
    },
  },
  {
    name: routesList.UPDATE_COMPANIES.name,
    path: routesList.UPDATE_COMPANIES.path,
    component: () => import("@/views/companies/update.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.SUPERADMIN_ID,
    },
  },
  {
    name: routesList.EMPLOYEES.name,
    path: routesList.EMPLOYEES.path,
    component: () => import("@/views/employees/index.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.SUPERADMIN_ID,
    }
  },
  {
    name: routesList.CREATE_EMPLOYEES.name,
    path: routesList.CREATE_EMPLOYEES.path,
    component: () => import("@/views/employees/create.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.SUPERADMIN_ID,
    },
  },
  {
    name: routesList.UPDATE_EMPLOYEES.name,
    path: routesList.UPDATE_EMPLOYEES.path,
    component: () => import("@/views/employees/update.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.SUPERADMIN_ID,
    },
  },
  {
    name: routesList.ROLES.name,
    path: routesList.ROLES.path,
    component: () => import("@/views/roles/index.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    }
  },
  {
    name: routesList.CREATE_ROLES.name,
    path: routesList.CREATE_ROLES.path,
    component: () => import("@/views/roles/create.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    }
  },
  {
    name: routesList.UPDATE_ROLES.name,
    path: routesList.UPDATE_ROLES.path,
    component: () => import("@/views/roles/update.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    }
  },
  {
    name: routesList.ORG_USER.name,
    path: routesList.ORG_USER.path,
    component: () => import("@/views/org-user/index.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    }
  },
  {
    name: routesList.CREATE_ORG_USER.name,
    path: routesList.CREATE_ORG_USER.path,
    component: () => import("@/views/org-user/create.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    }
  },
  {
    name: routesList.UPDATE_ORG_USER.name,
    path: routesList.UPDATE_ORG_USER.path,
    component: () => import("@/views/org-user/update.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    }
  },
  {
    name: routesList.OBJECTS.name,
    path: routesList.OBJECTS.path,
    component: () => import("@/views/objects/index.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    }
  },
  {
    name: routesList.CREATE_OBJECTS.name,
    path: routesList.CREATE_OBJECTS.path,
    component: () => import("@/views/objects/create.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    },
  },
  {
    name: routesList.UPDATE_OBJECTS.name,
    path: routesList.UPDATE_OBJECTS.path,
    component: () => import("@/views/objects/update.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    },
  },
  {
    name: routesList.BLOCKS.name,
    path: routesList.BLOCKS.path,
    component: () => import("@/views/blocks/index.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    }
  },
  {
    name: routesList.CREATE_BLOCKS.name,
    path: routesList.CREATE_BLOCKS.path,
    component: () => import("@/views/blocks/create.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    },
  },
  {
    name: routesList.UPDATE_BLOCKS.name,
    path: routesList.UPDATE_BLOCKS.path,
    component: () => import("@/views/blocks/update.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
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
  {
    name: routesList.EXPENSES.name,
    path: routesList.EXPENSES.path,
    component: () => import("@/views/expenses/index.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    }
  },
  {
    name: routesList.CREATE_EXPENSES.name,
    path: routesList.CREATE_EXPENSES.path,
    component: () => import("@/views/expenses/create.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    },
  },
  {
    name: routesList.UPDATE_EXPENSES.name,
    path: routesList.UPDATE_EXPENSES.path,
    component: () => import("@/views/expenses/update.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    },
  },
  {
    name: routesList.PRODUCTS.name,
    path: routesList.PRODUCTS.path,
    component: () => import("@/views/products/index.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    }
  },
  {
    name: routesList.CREATE_PRODUCTS.name,
    path: routesList.CREATE_PRODUCTS.path,
    component: () => import("@/views/products/create.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    }
  },
  {
    name: routesList.UPDATE_PRODUCTS.name,
    path: routesList.UPDATE_PRODUCTS.path,
    component: () => import("@/views/products/update.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    }
  },
  {
    name: routesList.WAREHOUSE.name,
    path: routesList.WAREHOUSE.path,
    component: () => import("@/views/warehouse/index.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    }
  },
  {
    name: routesList.CREATE_WAREHOUSE.name,
    path: routesList.CREATE_WAREHOUSE.path,
    component: () => import("@/views/warehouse/create.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    }
  },
  {
    name: routesList.UPDATE_WAREHOUSE.name,
    path: routesList.UPDATE_WAREHOUSE.path,
    component: () => import("@/views/warehouse/update.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    }
  },
  {
    name: routesList.APPLICATIONS.name,
    path: routesList.APPLICATIONS.path,
    component: () => import("@/views/applications/index.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    }
  },
  {
    name: routesList.CREATE_APPLICATIONS.name,
    path: routesList.CREATE_APPLICATIONS.path,
    component: () => import("@/views/applications/create.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    }
  },
  {
    name: routesList.VIEW_APPLICATIONS.name,
    path: routesList.VIEW_APPLICATIONS.path,
    component: () => import("@/views/applications/view.vue"),
    meta: {
      layout: DefaultLayouts,
      requiresAuth: true,
      roleId: roles.ORGADMIN_ID,
    }
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const userStore = await useUserStore();
  const { user } = storeToRefs(userStore);

  if (to?.name !== routesList.AUTH.name && (!user.value?.token || !user.value?.user?.roleId)) {
    return next({ name: routesList.AUTH.name });
  }

  if (to?.name !== routesList.AUTH.name && +to?.meta?.roleId !== +user.value?.user?.roleId) {
    return next({ name: routesList.HOME.name });
  }

  if (user.value?.token && user.value?.user?.roleId && to?.name === routesList.AUTH.name) {
    return next({ name: routesList.HOME.name });
  }

  return next();
});

export default router;

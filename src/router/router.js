import AuthLayouts from "@/layouts/AuthLayouts.vue"
import DefaultLayouts from "@/layouts/DefaultLayouts.vue"
import { useUserStore } from "@/store/userStore"
import { actionModules } from "@/utils/action-modules.js"
import { roles } from "@/utils/roles.js"
import { routes as routesList } from "@/utils/routes.js"
import { storeToRefs } from "pinia"
import { createRouter, createWebHistory } from "vue-router"

const routes = [
  {
    name: routesList.HOME.name,
    path: routesList.HOME.path,
    redirect: (to) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return { path: routesList.AUTH.path };
      }

      if (+user.value?.user?.roleId === +roles.SUPERADMIN_ID) {
        return { path: routesList.COMPANIES.path };
      }

      const keys = Object.keys(routesList);

      const route = keys?.find((elem) => user?.value.user?.modules?.includes(actionModules?.[elem]?.READ));

      if (!route) {
        return { path: routesList.AUTH.path };
      }

      return { path: routesList?.[route]?.path };
    },
  },
  {
    name: routesList.AUTH.name,
    path: routesList.AUTH.path,
    component: () => import("@/views/auth.vue"),
    meta: {
      layout: AuthLayouts,
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (to.name === routesList.AUTH.name && user.value?.token) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.COMPANIES.name,
    path: routesList.COMPANIES.path,
    component: () => import("@/views/company/index.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (+to.meta?.roleId !== +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.CREATE_COMPANIES.name,
    path: routesList.CREATE_COMPANIES.path,
    component: () => import("@/views/company/create.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (+to.meta?.roleId !== +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.UPDATE_COMPANIES.name,
    path: routesList.UPDATE_COMPANIES.path,
    component: () => import("@/views/company/update.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (+to.meta?.roleId !== +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.EMPLOYEES.name,
    path: routesList.EMPLOYEES.path,
    component: () => import("@/views/employee/index.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (+to.meta?.roleId !== +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.CREATE_EMPLOYEES.name,
    path: routesList.CREATE_EMPLOYEES.path,
    component: () => import("@/views/employee/create.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (+to.meta?.roleId !== +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.UPDATE_EMPLOYEES.name,
    path: routesList.UPDATE_EMPLOYEES.path,
    component: () => import("@/views/employee/update.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (+to.meta?.roleId !== +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.ROLE.name,
    path: routesList.ROLE.path,
    component: () => import("@/views/role/index.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.ROLE.READ
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.CREATE_ROLE.name,
    path: routesList.CREATE_ROLE.path,
    component: () => import("@/views/role/create.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.ROLE.CREATE
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.UPDATE_ROLE.name,
    path: routesList.UPDATE_ROLE.path,
    component: () => import("@/views/role/update.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.ROLE.UPDATE
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.ORG_USER.name,
    path: routesList.ORG_USER.path,
    component: () => import("@/views/org-user/index.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.ORG_USER.READ
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.CREATE_ORG_USER.name,
    path: routesList.CREATE_ORG_USER.path,
    component: () => import("@/views/org-user/create.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.ORG_USER.CREATE
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.UPDATE_ORG_USER.name,
    path: routesList.UPDATE_ORG_USER.path,
    component: () => import("@/views/org-user/update.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.ORG_USER.UPDATE
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.OBJECT.name,
    path: routesList.OBJECT.path,
    component: () => import("@/views/object/index.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.OBJECT.READ
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.CREATE_OBJECT.name,
    path: routesList.CREATE_OBJECT.path,
    component: () => import("@/views/object/create.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.OBJECT.CREATE
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.UPDATE_OBJECT.name,
    path: routesList.UPDATE_OBJECT.path,
    component: () => import("@/views/object/update.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.OBJECT.UPDATE
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.BLOCK.name,
    path: routesList.BLOCK.path,
    component: () => import("@/views/block/index.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.BLOCK.READ
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.CREATE_BLOCK.name,
    path: routesList.CREATE_BLOCK.path,
    component: () => import("@/views/block/create.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.BLOCK.CREATE
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.UPDATE_BLOCK.name,
    path: routesList.UPDATE_BLOCK.path,
    component: () => import("@/views/block/update.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.BLOCK.UPDATE
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.ESTIMATE.name,
    path: routesList.ESTIMATE.path,
    component: () => import("@/views/estimate/index.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.ESTIMATE.READ
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.CREATE_ESTIMATE.name,
    path: routesList.CREATE_ESTIMATE.path,
    component: () => import("@/views/estimate/create.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.ESTIMATE.CREATE
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.UPDATE_ESTIMATE.name,
    path: routesList.UPDATE_ESTIMATE.path,
    component: () => import("@/views/estimate/update.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.ESTIMATE.UPDATE
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.COST.name,
    path: routesList.COST.path,
    component: () => import("@/views/cost/index.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.COST.READ
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.CREATE_COST.name,
    path: routesList.CREATE_COST.path,
    component: () => import("@/views/cost/create.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.COST.CREATE
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.UPDATE_COST.name,
    path: routesList.UPDATE_COST.path,
    component: () => import("@/views/cost/update.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.COST.UPDATE
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.PRODUCT.name,
    path: routesList.PRODUCT.path,
    component: () => import("@/views/product/index.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.PRODUCT.READ
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.CREATE_PRODUCT.name,
    path: routesList.CREATE_PRODUCT.path,
    component: () => import("@/views/product/create.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.PRODUCT.CREATE
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.UPDATE_PRODUCT.name,
    path: routesList.UPDATE_PRODUCT.path,
    component: () => import("@/views/product/update.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.PRODUCT.UPDATE
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.WAREHOUSE.name,
    path: routesList.WAREHOUSE.path,
    component: () => import("@/views/warehouse/index.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.WAREHOUSE.READ
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.CREATE_WAREHOUSE.name,
    path: routesList.CREATE_WAREHOUSE.path,
    component: () => import("@/views/warehouse/create.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.WAREHOUSE.CREATE
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.UPDATE_WAREHOUSE.name,
    path: routesList.UPDATE_WAREHOUSE.path,
    component: () => import("@/views/warehouse/update.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.WAREHOUSE.UPDATE
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.APPLICATION.name,
    path: routesList.APPLICATION.path,
    component: () => import("@/views/application/index.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.APPLICATION.READ
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.CREATE_APPLICATION.name,
    path: routesList.CREATE_APPLICATION.path,
    component: () => import("@/views/application/create.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.APPLICATION.CREATE
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.VIEW_APPLICATION.name,
    path: routesList.VIEW_APPLICATION.path,
    component: () => import("@/views/application/view.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.APPLICATION.READ
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.MANAGEMENT.name,
    path: routesList.MANAGEMENT.path,
    component: () => import("@/views/management.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      modules: [actionModules.ROLE.READ, actionModules.ORG_USER.READ, actionModules.MANAGEMENT_ROLE.READ]
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!to.meta?.modules.some(value => user?.value?.user?.modules?.includes(value))) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.MANAGEMENT_ROLE.name,
    path: routesList.MANAGEMENT_ROLE.path,
    component: () => import("@/views/management-role.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.MANAGEMENT_ROLE.READ
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.EXPENS.name,
    path: routesList.EXPENS.path,
    component: () => import("@/views/expens/index.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.EXPENS.READ
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.CREATE_EXPENS.name,
    path: routesList.CREATE_EXPENS.path,
    component: () => import("@/views/expens/create.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.EXPENS.CREATE
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.VIEW_EXPENS.name,
    path: routesList.VIEW_EXPENS.path,
    component: () => import("@/views/expens/view.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.EXPENS.READ
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  {
    name: routesList.REPORTS.name,
    path: routesList.REPORTS.path,
    component: () => import("@/views/reports.vue"),
    meta: {
      layout: DefaultLayouts,
      roleId: roles.SUPERADMIN_ID,
      module: actionModules.REPORTS.READ
    },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);

      if (!user.value?.token) {
        return next({ name: routesList.AUTH.name });
      }

      if (!user?.value.user?.modules?.includes(+to.meta.module)) {
        return next({ name: routesList.HOME.name });
      }

      if (+to.meta?.roleId === +user.value?.user?.roleId) {
        return next({ name: routesList.HOME.name });
      }

      return next();
    },
  },
  { 
		path: '/:catchAll(.*)', 
		redirect: routesList.HOME.path 
	}
];

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes,
});

export default router;

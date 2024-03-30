<template>
    <nav :class="`menu ${isOpenPanel ? 'centered' : ''}`">
        <ul class="menu-list">
            <template v-for="item in menu" :key="item.id">
                <li class="menu-item" v-if="+item?.roleId === +user?.user?.roleId">
                    <router-link :to="item.to" :class="`menu-link ${isOpenPanel ? 'centered' : ''}`">
                        <span class="menu-icon">
                            <Icon :name="item.icon" />
                        </span>
                        <span :class="`menu-text ${isOpenPanel ? 'hide' : ''}`">
                            {{ $t(item.label) }}
                        </span>
                    </router-link>
                </li>
                <li class="menu-item" v-if="user?.user?.modules?.includes(item?.moduleId)">
                    <router-link :to="item.to" :class="`menu-link ${isOpenPanel ? 'centered' : ''}`">
                        <span class="menu-icon">
                            <Icon :name="item.icon" />
                        </span>
                        <span :class="`menu-text ${isOpenPanel ? 'hide' : ''}`">
                            {{ $t(item.label) }}
                        </span>
                    </router-link>
                </li>
            </template>
        </ul>
    </nav>
</template>

<script setup>
import { ref } from "vue";
import { usePanelStore } from "@/store/panelStore";
import { useUserStore } from "@/store/userStore";
import { storeToRefs } from "pinia";
import { routes } from "@/utils/routes";
import { roles } from "@/utils/roles";
import { actionModules } from "@/utils/action-modules.js";

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const menu = ref([
    { id: 1, label: "itemAdminCompanies", icon: "companies", to: routes.COMPANIES.path, roleId: roles.SUPERADMIN_ID },
    { id: 2, label: "itemAdminEmployees", icon: "employees", to: routes.EMPLOYEES.path, roleId: roles.SUPERADMIN_ID },
    { id: 3, label: "itemUserApplications", icon: "info", to: routes.APPLICATION.path, moduleId: actionModules.APPLICATION.READ },
    { id: 4, label: "itemUserEstimate", icon: "estimate", to: routes.ESTIMATE.path, moduleId: actionModules.ESTIMATE.READ },  
    { id: 5, label: "itemUserObjects", icon: "objects", to: routes.OBJECT.path, moduleId: actionModules.OBJECT.READ },
    { id: 6, label: "itemUserBlocks", icon: "blocks", to: routes.BLOCK.path, moduleId: actionModules.BLOCK.READ },
    { id: 7, label: "itemUserCosts", icon: "costs", to: routes.COST.path, moduleId: actionModules.COST.READ },
    { id: 8, label: "itemUserProducts", icon: "brick", to: routes.PRODUCT.path, moduleId: actionModules.PRODUCT.READ },
    { id: 9, label: "itemUserWarehouse", icon: "warehouse", to: routes.WAREHOUSE.path, moduleId: actionModules.WAREHOUSE.READ },
    { id: 10, label: "itemUserExpenses", icon: "expens", to: routes.EXPENS.path, moduleId: actionModules.EXPENS.READ },
    // { id: 10, label: "itemUserRoles", icon: "roles", to: routes.ROLE.path, moduleId: actionModules.ROLE.READ },
    // { id: 11, label: "itemUserOrgEmployees", icon: "employees", to: routes.ORG_USER.path, moduleId: actionModules.ORG_USER.READ },
]);

const panelStore = usePanelStore();
const { isOpenPanel } = storeToRefs(panelStore);
</script>

<style lang="scss" scoped>
.menu {
    flex-grow: 1;
    margin-top: 45px;

    &.centered {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    &-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    &-link {
        display: flex;
        align-items: center;
        gap: 25px;
        padding: 10px 15px;
        border-radius:  0 20px 20px 0;
        border: 1px solid transparent;
        transition: 0.5s;
        @media (max-width: 768px) {
            gap: 10px;
        }
        &.centered {
            justify-content: center;
        }
        &.router-link-active  {
            border-color: var(--white);
        }
    }

    &-icon {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    &-text {
        color: var(--white);
        transition: 0.5s;
        @media (max-width: 768px) {
            font-size: 14px;
        }
        @media (max-width: 720px) {
            display: none;
        }
        &.hide {
            display: none;
        }
    }
}

@media (hover: hover) {
    .menu {
        &-link {
            &:hover {
                border-color: var(--white);
            }
        }
    }
}
</style>
<template>
    <nav :class="`menu ${isOpenPanel ? 'centered' : ''}`">
        <ul class="menu-list">
            <template v-for="item in menu" :key="item.id">
                <li v-if="+item?.roleId === +user?.user?.roleId" class="menu-item">
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

const menu = ref([
    { id: 1, label: "itemAdminCompanies", icon: "companies", to: routes.COMPANIES.path, roleId: roles.SUPERADMIN_ID },
    { id: 2, label: "itemAdminEmployees", icon: "employees", to: routes.EMPLOYEES.path, roleId: roles.SUPERADMIN_ID },
    { id: 3, label: "itemUserRoles", icon: "roles", to: routes.ROLES.path, roleId: roles.ORGADMIN_ID },
    { id: 4, label: "itemUserOrgEmployees", icon: "employees", to: routes.ORG_USER.path, roleId: roles.ORGADMIN_ID },
    { id: 5, label: "itemUserObjects", icon: "objects", to: routes.OBJECTS.path, roleId: roles.ORGADMIN_ID },
    { id: 6, label: "itemUserBlocks", icon: "blocks", to: routes.BLOCKS.path, roleId: roles.ORGADMIN_ID },
    { id: 7, label: "itemUserExpenses", icon: "expenses", to: routes.EXPENSES.path, roleId: roles.ORGADMIN_ID },
    { id: 8, label: "itemUserProducts", icon: "brick", to: routes.PRODUCTS.path, roleId: roles.ORGADMIN_ID },
    { id: 9, label: "itemUserWarehouse", icon: "warehouse", to: routes.WAREHOUSE.path, roleId: roles.ORGADMIN_ID },
    { id: 10, label: "itemUserApplications", icon: "info", to: routes.APPLICATIONS.path, roleId: roles.ORGADMIN_ID },
    // { id: 11, label: "itemUserSmeta", icon: "smeta", to: "/smeta", roleId: "2" },
]);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

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
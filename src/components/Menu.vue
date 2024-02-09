<template>
    <nav :class="`menu ${isOpenPanel ? 'centered' : ''}`">
        <ul class="menu-list">
            <template v-for="item in menu" :key="item.id">
                <li v-if="item?.roleId === roleId" class="menu-item">
                    <router-link :to="item.to" class="menu-link">
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
import { storeToRefs } from "pinia";
import { routes } from "@/utils/routes";

const menu = ref([
    { id: 1, label: "itemAdminCompanies", icon: "companies", to: routes.COMPANIES.path, roleId: "1" },
    { id: 2, label: "itemAdminEmployees", icon: "employees", to: "/employees", roleId: "1" },
    { id: 3, label: "itemUserObjects", icon: "objects", to: routes.OBJECTS.path, roleId: "2" },
    { id: 4, label: "itemUserBlocks", icon: "blocks", to: routes.BLOCKS.path, roleId: "2" },
    // { id: 5, label: "itemUserSmeta", icon: "smeta", to: "/smeta", roleId: "2" },
    // { id: 6, label: "itemUserRoles", icon: "roles", to: "/roles", roleId: "2" },
    { id: 7, label: "itemUserOrgEmployees", icon: "employees", to: routes.ORG_USER.path, roleId: "2" },
    { id: 8, label: "itemUserExpenses", icon: "expenses", to: routes.EXPENSES.path, roleId: "2" },
    { id: 9, label: "itemUserProducts", icon: "brick", to: routes.PRODUCTS.path, roleId: "2" },
    { id: 10, label: "itemUserWarehouse", icon: "warehouse", to: routes.WAREHOUSE.path, roleId: "2" },
    { id: 11, label: "itemUserApplications", icon: "info", to: routes.APPLICATIONS.path, roleId: "2" },
]);

const roleId = ref(localStorage.getItem('roleId'));

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
        border-radius: 20px;
        border: 1px solid transparent;
        transition: 0.5s;
        @media (max-width: 768px) {
            gap: 10px;
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
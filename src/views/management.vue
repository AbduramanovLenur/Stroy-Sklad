<template>
    <section class="management section-height shadowed">
        <div class="management__inner">
            <ul class="management__list">
                <template v-for="item in menu" :key="item.id" >
                    <ManagementItem 
                        v-if="user?.user?.modules?.includes(item.module)"
                        :menu="item"
                    />
                </template>
            </ul>
        </div>
    </section>
</template>

<script setup>
import { useUserStore } from "@/store/userStore";
import { storeToRefs } from "pinia";
import { routes } from "@/utils/routes.js";
import { actionModules } from "@/utils/action-modules.js"
import ManagementItem from "@/components/ManagementItem.vue";

const menu = [
    { id: 1, to: routes.ROLE.path, module: actionModules.ROLE.READ, icon: "roles", label: "itemUserRoles", className: "management-icon" },
    { id: 2, to: routes.ORG_USER.path, module: actionModules.ORG_USER.READ, icon: "org-user", label: "itemUserOrgEmployees", className: "management-icon" },
    { id: 3, to: routes.MANAGEMENT_ROLE.path, module: actionModules.MANAGEMENT_ROLE.READ, icon: "management", label: "itemUserManagement", className: "management-icon" }
]

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
</script>

<style lang="scss" scoped>
.management {
    &__inner {
        padding: 20px 0;
    }
    &__list {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 30px;
        @media (max-width: 1350px) {
            gap: 20px;
        }
        @media (max-width: 1152px) {
            grid-template-columns: repeat(2, 1fr);
        }
        @media (max-width: 864px) {
            grid-template-columns: repeat(1, 1fr);
        }
    }
}
</style>
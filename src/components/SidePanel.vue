<template>
    <aside :class="`sidepanel ${isOpenPanel ? 'isOpen' : ''}`">
        <div :class="`sidepanel__inner ${isOpenPanel ? 'isOpen' : ''}`">
            <router-link :to="routes.HOME.path" :class="`sidepanel__logo ${isOpenPanel ? 'centered' : ''}`">
                <span class="sidepanel__logo-circle">
                    <img 
                        src="@/assets/images/logo/circle.svg" 
                        alt="logo" 
                        loading="lazy" 
                        width="35" 
                        height="30"
                    >
                </span>
                <span :class="`sidepanel__logo-picture ${isOpenPanel ? 'hide' : ''}`">
                    <img 
                        src="@/assets/images/logo/logo.svg" 
                        alt="logo" 
                        loading="lazy" 
                        width="130" 
                        height="40"
                    >
                </span>
            </router-link>
            <Menu />
            <router-link 
                v-if="managementModules.some(value => user?.user?.modules?.includes(value))"
                :class="`sidepanel__management ${isOpenPanel ? 'centered' : ''}`" 
                :to="routes.MANAGEMENT"
            >
                <span class="sidepanel__management-icon">
                    <Icon name="setting" />
                </span>
                <span :class="`sidepanel__management-text ${isOpenPanel ? 'hide' : ''}`">
                    {{ $t("moreLink") }}
                </span>
            </router-link>
            <button 
                :class="`sidepanel__logout ${isOpenPanel ? 'centered' : ''}`"
                type="button" 
                @click="logoutHandler"
            >
                <span class="sidepanel__logout-icon">
                    <Icon name="logout" />
                </span>
                <span :class="`sidepanel__logout-text ${isOpenPanel ? 'hide' : ''}`">
                    {{ $t("logoutButton") }}
                </span>
            </button>
        </div>
    </aside>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { usePanelStore } from "@/store/panelStore";
import { useUserStore } from "@/store/userStore";
import { storeToRefs } from "pinia";
import { routes } from "@/utils/routes.js";
import Menu from "@/components/Menu.vue";
import { actionModules } from "@/utils/action-modules.js";

const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const userStore = useUserStore();
const { resetUser } = userStore;
const { user } = storeToRefs(userStore);

const panelStore = usePanelStore();
const { isOpenPanel } = storeToRefs(panelStore);

const managementModules = computed(() => [actionModules.ROLE.READ, actionModules.ORG_USER.READ, actionModules.MANAGEMENT_ROLE.READ]);

const logoutHandler = async () => {
    toast.success(t("logoutToast"));
    resetUser();

    router.push(routes.AUTH.path);
}
</script>

<style lang="scss" scoped>
.sidepanel {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    background: radial-gradient(103.88% 58.43% at 56.74% 50%, #0085FF 0%, #003465 100%);
    width: 255px;
    overflow-y: auto;
    overflow-x: hidden;
    color: var(--white);
    transition: 0.2s;
    z-index: 1000;
    &::-webkit-scrollbar {
        background-color: transparent;
        width: 1px;
    }

    @media (max-width: 768px) {
        width: 200px;
    }

    @media (max-width: 720px) {
        left: -100%;
    }

    &.isOpen {
        width: 100px;
        @media (max-width: 720px) {
            left: 0;
        }
        @media (max-width: 480px) {
            width: 70px;
        }
    }

    &__inner {
        display: flex;
        flex-direction: column;
        padding: 35px 40px;
        min-height: 100%;
        @media (max-width: 768px) {
            padding: 35px 20px;
        }
        &.isOpen {
            padding: 35px 20px;
            @media (max-width: 480px) {
                padding: 35px 10px;
            }
        }
    }

    &__logo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;

        &-circle {
            flex-shrink: 0;
        }

        &-picture {
            flex-shrink: 0;
        }
    }

    &__management {
        display: flex;
        align-items: center;
        gap: 25px;
        margin-top: 40px;
        padding: 10px 15px;
        border: 1px solid transparent;
        border-radius:  0 20px 20px 0;
        transition: 0.5s;
        @media (max-width: 768px) {
            gap: 10px;
        }
        &.router-link-active  {
            border-color: var(--white);
        }
        &.centered {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        &-icon {
            display: flex;
            align-items: center;
        }
        &-text {
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

    &__logout {
        display: flex;
        align-items: center;
        gap: 25px;
        margin-top: 15px;
        padding: 10px 15px;
        border: 1px solid transparent;
        border-radius:  0 20px 20px 0;
        transition: 0.5s;
        @media (max-width: 768px) {
            gap: 10px;
        }
        &.centered {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        &-icon {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        &-text {
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
}

@media (hover: hover) {
    .sidepanel {
        &__management {
            &:hover {
                border-color: var(--white);
            }
        }
        &__logout {
            &:hover {
                border-color: var(--white);
            }
        }
    }
}
</style>
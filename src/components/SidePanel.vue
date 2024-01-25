<template>
    <aside :class="`sidepanel ${isOpen ? 'isOpen' : ''}`">
        <div :class="`sidepanel__inner ${isOpen ? 'isOpen' : ''}`">
            <div :class="`sidepanel__logo ${isOpen ? 'centered' : ''}`">
                <div class="sidepanel__logo-picture">
                    <img 
                        src="@/assets/images/logo/logo.svg" 
                        alt="logo" 
                        loading="lazy" 
                        width="30" 
                        height="80"
                    >
                </div>
                <div :class="`sidepanel__logo-text ${isOpen ? 'hide' : ''}`">
                    Stroy <br>
                    Sklad
                </div>
            </div>
            <Menu />
            <button 
                :class="`sidepanel__logout ${isOpen ? 'centered' : ''}`"
                type="button" 
                @click="logoutHandler"
            >
                <span class="sidepanel__logout-icon">
                    <Icon name="logout" />
                </span>
                <span :class="`sidepanel__logout-text ${isOpen ? 'hide' : ''}`">
                    {{ $t("logoutButton") }}
                </span>
            </button>
        </div>
    </aside>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { usePanelStore } from "@/store/panelStore";
import { storeToRefs } from "pinia";
import Menu from "@/components/Menu.vue";
import Icon from "@/components/Icon.vue";

const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const panelStore = usePanelStore();
const { isOpen } = storeToRefs(panelStore);

const logoutHandler = () => {
    router.push("/auth");
    toast.success(t("logoutToast"))
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
        height: 100%;
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
        gap: 25px;

        &.centered {
            display: flex;
            justify-content: center;
        }

        &-picture {
            flex-shrink: 0;
        }

        &-text {
            font-size: 32px;
            font-weight: 700;
            line-height: 1.2;
            color: var(--white);
            transition: 0.5s;
            @media (max-width: 720px) {
                display: none;
            }
        }
    }

    &__logout {
        display: flex;
        align-items: center;
        gap: 25px;
        margin-top: 45px;
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
</style>
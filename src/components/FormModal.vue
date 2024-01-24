<template>
    <div :class="`form-modal ${isOpenModalForm ? 'is-active' : ''}`" @click="toggleIsOpenModalForm">
        <div class="form-modal__overlay" @click.stop>
            <h2 class="form-modal__title">
                {{ $t(title) }}
            </h2>
            <slot />
            <div class="form-modal__close" @click="toggleIsOpenModalForm">
                <Icon name="close" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { useModalsStore } from "@/store/modalsStore.js";
import { storeToRefs } from "pinia";
import Icon from "@/components/Icon.vue";

defineProps(["title"]);

const modalsStore = useModalsStore();
const { toggleIsOpenModalForm } = modalsStore;
const { isOpenModalForm } = storeToRefs(modalsStore);
</script>

<style lang="scss" scoped>
.form-modal {
    display: flex;
    justify-content: flex-end;
    position: fixed;
    top: 0;
    right: -100%;
    width: 100%;
    height: 100%;
    z-index: 1002;
    transition: 0.5s;
    &.is-active {
        right: 0;
    }
    &__overlay {
        position: relative;
        max-width: 50%;
        width: 100%;
        height: 100%;
        background-color: rgb(241, 237, 237);
        padding: 100px 40px;
        -webkit-box-shadow: 0px 0px 41px 0px rgba(0, 0, 0, 0.2);
        -moz-box-shadow: 0px 0px 41px 0px rgba(0, 0, 0, 0.2);
        box-shadow: 0px 0px 41px 0px rgba(0, 0, 0, 0.2);
        overflow-y: auto;
        
        @media (max-width: 1024px) {
            max-width: 65%;
        }

        @media (max-width: 768px) {
            max-width: 80%;
        }

        @media (max-width: 480px) {
            max-width: 100%;
            padding: 70px 20px;
        }

        &::-webkit-scrollbar {
            background-color: transparent;
            width: 1px;
        }
    }
    &__title {
        font-size: 38px;
        margin-bottom: 30px;
        @media (max-width: 768px) {
            font-size: 32px;
            margin-bottom: 20px;
        }
        @media (max-width: 480px) {
            font-size: 28px;
            margin-bottom: 15px;
        }
        @media (max-width: 360px) {
            font-size: 24px;
        }
    }
    &__close {
        position: absolute;
        top: 20px;
        left: 20px;
    }
}
</style>
<template>
    <header class="header">
        <div class="header__inner">
            <Burger />
            <div class="header__info">
                <div class="header__organization">
                    {{ $t('organization') }} {{ organization }}
                </div>
                <div class="header__user">
                    {{ role }} : {{ name }}
                </div>
            </div>
            <SwitcherLang className="header__langs" />
        </div>
    </header>
</template>

<script setup>
import { ref } from "vue";
import Burger from "@/components/Burger.vue";

const organization = ref(localStorage.getItem("organization"));
const name = ref(localStorage.getItem("name"));
const role = ref(localStorage.getItem("role"));
</script>

<style lang="scss" scoped>
.header {
    -webkit-box-shadow: 0px 0px 33px -1px rgba(0, 0, 0, 0.2);
    -moz-box-shadow: 0px 0px 33px -1px rgba(0, 0, 0, 0.2);
    box-shadow: 0px 0px 33px -1px rgba(0, 0, 0, 0.2);
    margin: 20px;
    border-radius: 20px;

    &__inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 30px;
        padding: 30px;
        @media (max-width: 1024px) {
            gap: 15px;
        }
        @media (max-width: 600px) {
            display: grid;
            grid-template-columns: 2fr 1fr;
        }
        @media (max-width: 480px) {
            padding: 30px 15px;
            grid-template-columns: 1fr 2fr;
        }
    }

    &__info {
        margin-right: auto;
        @media (max-width: 600px) {
            order: 3;
            grid-column: span 2;
        }
    }

    &__organization {
        font-size: 18px;
        font-weight: 700;
        @media (max-width: 480px) {
            font-size: 14px;
        }
    }

    &__user {
        font-size: 16px;
        @media (max-width: 480px) {
            font-size: 13px;
        }
    }

    &__langs {
        @media (max-width: 600px) {
            margin-left: auto;
        }
    }
}
</style>
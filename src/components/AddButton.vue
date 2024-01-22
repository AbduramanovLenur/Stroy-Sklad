<template>
    <router-link :to="to" class="add-button">
        <span class="add-button__icon">
            <Icon name="add-company" />
        </span>
        <span class="add-button__text">
            {{ $t("addButton") }}
        </span>
    </router-link>
</template>

<script setup>
import Icon from "@/components/Icon.vue";

defineProps(["to"]);
</script>

<style lang="scss" scoped>
.add-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background-color: var(--black);
    border-radius: 5px;
    max-width: 150px;
    width: 100%;
    height: 40px;
    padding: 5px 10px;
    transition: 0.5s;

    @media (max-width: 1024px) {
        margin-left: auto;
    }

    @media (max-width: 480px) {
        margin-left: initial;
    }

    &__icon {
        display: flex;
        align-items: center;
    }

    &__text {
        font-weight: 500;
        text-transform: uppercase;
        color: var(--white);
        @media (max-width: 480px) {
            font-size: 14px;
        }
    }
}

@media (hover: hover) {
    .add-button {
        &:hover {
            -webkit-box-shadow: 0px 0px 24px 6px rgba(0, 0, 0, 0.2);
            -moz-box-shadow: 0px 0px 24px 6px rgba(0, 0, 0, 0.2);
            box-shadow: 0px 0px 24px 6px rgba(0, 0, 0, 0.2);
        }
    }
}
</style>
<template>
    <button type="button" class="add-button hovered" @click="() => $emit('onOpenFormModal')">
        <span class="add-button__icon">
            <Icon name="add-company" />
        </span>
        <span class="add-button__text">
            {{ $t("addButton") }}
        </span>
    </button>
</template>

<script setup></script>

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
</style>
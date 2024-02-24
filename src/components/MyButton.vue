<template>
    <router-link v-if="type === 'link'" :to="to" class="add-button hovered" :style="`background-color: var(--${color}); max-width: ${width}px`">
        <span class="add-button__icon">
            <Icon :name="icon" />
        </span>
        <span class="add-button__text">
            <slot />
        </span>
    </router-link>
    <button v-else :type="type" class="add-button hovered" :style="`background-color: var(--${color}); max-width: ${width}px`">
        <span class="add-button__icon">
            <Icon :name="icon" />
        </span>
        <span class="add-button__text">
            <slot />
        </span>
    </button>
</template>

<script setup>
defineProps({
    to: String,
    icon: String,
    type: String,
    color: String,
    width: {
        type: Number,
        default: () => 150
    }
});
</script>

<style lang="scss" scoped>
.add-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border-radius: 5px;
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
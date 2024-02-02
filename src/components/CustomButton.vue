<template>
    <button :class="`button hovered ${className}`" :type="type" :style="`max-width: ${width}px;`">
        <slot />
    </button>
</template>

<script setup>
defineProps({
    type: String, 
    width: String,
    className: {
        type: String,
        default: () => ""
    }
});
</script>

<style lang="scss" scoped>
.button {
    font-size: 18px;
    font-weight: 700;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    border-radius: 20px;
    height: 50px;
    background-color: var(--black);
    color: var(--white);
    width: 100%;
    max-width: 500px;
    &.form__submit {
        margin-top: auto;
        &.centered {
            margin: auto 0;
        }
    }
}
</style>
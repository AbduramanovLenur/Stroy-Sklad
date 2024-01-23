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
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    border-radius: 20px;
    height: 50px;
    background-color: var(--black);
    color: var(--white);
    width: 100%;
}
</style>
<template>
    <button :class="`button hovered ${className}`" :type="type" :style="`max-width: ${width}px;`" :disabled="isDisabled">
        <slot />
    </button>
</template>

<script setup>
defineProps({
    type: {
        type: String,
        default: () => "submit"
    }, 
    width: {
        type: Number,
        default: () => 500
    },
    className: {
        type: String,
        default: () => ""
    },
    isDisabled: {
        type: Boolean,
        default: () => false
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
    &.form__submit {
        margin-top: auto;
        height: 60px;
        &.centered {
            margin: auto 0;
        }
    }
    &.margened {
        margin-bottom: 20px;
    }
    &.companies-add {
        padding: 12px;
        margin-bottom: 25px;
        margin-left: auto;
        margin-right: auto;
    }
}
</style>
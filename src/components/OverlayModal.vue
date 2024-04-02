<template>
    <div :class="`modal ${isOpen ? 'is-active' : ''}`" @click="() => $emit('onCloseModal')">
        <div class="modal__overlay" :style="`max-width: ${width}px;`" @click.stop>
            <slot />
            <div class="modal__close" @click="() => $emit('onCloseModal')">
                <Icon name="close" />
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    isOpen: Boolean,
    width: Number
});
</script>

<style lang="scss" scoped>
.modal {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    visibility: hidden;
    opacity: 0;
    transition: 0.2s;
    z-index: 1000;
    padding: 20px;
    height: 100vh;
    &.is-active {
        opacity: 1;
        visibility: visible;
    }
    &__overlay {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        background-color: var(--white);
        padding: 70px 20px 20px;
        border-radius: 20px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        &::-webkit-scrollbar {
            background-color: transparent;
            width: 1px;
        }
    }

    &__close {
        position: absolute;
        top: 20px;
        right: 20px;
    }
}
</style>
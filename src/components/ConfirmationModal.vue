<template>
    <div :class="`confirmation-modal ${isOpen ? 'is-active' : ''}`" @click="() => $emit('onNotConfirmed')">
        <div class="confirmation-modal__overlay" @click.stop>
            <h4 class="confirmation-modal__title">
                <slot />
            </h4>
            <div class="confirmation-modal__triggers">
                <button type="button" class="confirmation-modal__accepted" @click="() => $emit('onConfirmed')">
                    {{ $t("yesButton") }}
                </button>
                <button type="button" class="confirmation-modal__refused" @click="() => $emit('onNotConfirmed')">
                    {{ $t("noButton") }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps(["isOpen"]);
</script>

<style lang="scss" scoped>
.confirmation-modal {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.2);
    opacity: 0;
    visibility: hidden;
    transition: 0.5s;
    &.is-active {
        opacity: 1;
        visibility: visible;
    }
    &__overlay {
        max-width: 450px;
        width: 100%;
        background-color: var(--white);
        border-radius: 20px;
        padding: 30px;
    }
    &__title {
        font-size: 18px;
        display: flex;
        flex-direction: column;
        text-align: center;
        margin-bottom: 40px;
    }
    &__triggers {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 30px;
    }
    &__accepted,
    &__refused {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
        max-width: 70px;
        width: 100%;
        height: 30px;
        border-radius: 20px;
        color: var(--white);
    }

    &__accepted {
        background-color: var(--green);
    }
    &__refused {
        background-color: var(--red);
    }
}
</style>
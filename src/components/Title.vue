<template>
    <h2 class="title">
        <slot />
    </h2>
</template>

<script setup></script>

<style lang="scss" scoped>
.title {
    font-size: 35px;
    text-transform: uppercase;

    @media (max-width: 1024px) {
        font-size: 32px;
    }

    @media (max-width: 768px) {
        font-size: 28px;
    }

    @media (max-width: 480px) {
        font-size: 24px;
    }
}
</style>
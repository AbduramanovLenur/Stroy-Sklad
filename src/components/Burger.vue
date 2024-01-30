<template>
    <div class="burger" @click="toggleIsOpenPanel">
        <span></span>
        <span></span>
        <span></span>
    </div>
</template>

<script setup>
import { usePanelStore } from "@/store/panelStore";

const panelStore = usePanelStore();
const { toggleIsOpenPanel } = panelStore;
</script>

<style lang="scss" scoped>
.burger {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    height: 25px;
    width: 30px;
    transition: 0.5s;
    cursor: pointer;
    overflow: hidden;
    flex-shrink: 0;

    span {
        position: absolute;
        height: 5px;
        width: 30px;
        background-color: var(--black);
        border-radius: 5px;
        cursor: pointer;
        transition: 0.5s;

        &:nth-child(1) {
            transform: translateY(-10px);
            // width: 30px;
        }

        &:nth-child(2) {
            // width: 24px;
            right: 0;
        }

        &:nth-child(3) {
            transform: translateY(10px);
            // width: 17px;
            right: 0;
        }
    }
}
</style>
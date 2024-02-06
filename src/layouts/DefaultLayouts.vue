<template>
    <div class="wrapper">
        <SidePanel />
        <div :class="`main-panel ${isOpenPanel ? 'extended' : ''}`">
            <Header />
            <main class="main">
                <Suspense>
                    <slot />
                </Suspense>
            </main>
        </div>
    </div>
</template>

<script setup>
import { usePanelStore } from "@/store/panelStore";
import { storeToRefs } from "pinia";
import SidePanel from "@/components/SidePanel.vue";
import Header from "@/components/Header.vue";

const panelStore = usePanelStore();
const { isOpenPanel } = storeToRefs(panelStore);
</script>

<style lang="scss" scoped>
.main {
    margin: 20px;
    &-panel {
        width: 100%;
        margin-left: 255px;
        transition: 0.2s;
        overflow: auto;

        @media (max-width: 768px) {
            margin-left: 200px;
        }

        @media (max-width: 720px) {
            margin-left: 0;
        }
        &.extended {
            margin-left: 100px; 
            @media (max-width: 480px) {
                margin-left: 70px;
            }
        }
    }
}
</style>
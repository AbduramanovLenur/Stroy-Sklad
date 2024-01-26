<template>
    <div class="wrapper">
        <SidePanel />
        <div :class="`main-panel ${isOpen ? 'extended' : ''}`">
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
const { isOpen } = storeToRefs(panelStore);
</script>

<style lang="scss" scoped>
.main {
    margin: 20px;
    -webkit-box-shadow: 0px 0px 33px -1px rgba(0, 0, 0, 0.2);
    -moz-box-shadow: 0px 0px 33px -1px rgba(0, 0, 0, 0.2);
    box-shadow: 0px 0px 33px -1px rgba(0, 0, 0, 0.2);
    border-radius: 20px;
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
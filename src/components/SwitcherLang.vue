<template>
    <ul :class="`switcher-langs ${className}`">
        <li 
            v-for="lang in langs" 
            :key="lang.id" 
            class="switcher-lang"
            @click="() => switchLang(lang.language)"
        >
            <div class="switcher-lang__picture">
                <img :src="getImagePath('langs', `${lang.icon}.png`)" :alt="lang.icon" loading="lazy" width="32" height="32">
            </div>
        </li>
    </ul>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { getImagePath } from "@/utils/getPath.js";

defineProps({
    className: {
        type: String,
        default: () => ""
    }
});

const langs = ref([
    { id: 1, language: "uz", icon: "uzbekistan" },
    { id: 2, language: "ru", icon: "russia" },
]);

const { locale } = useI18n({ useScope: 'global' });

const switchLang = (lang) => {
    if(locale.value == lang) return;

    locale.value = lang;
    localStorage.setItem('lang', locale.value);
    window.location.reload();
}
</script>

<style lang="scss" scoped>
.switcher {
    &-langs {
        display: flex;
        align-items: center;
        gap: 20px;
        @media (max-width: 768px) {
            gap: 10px;
        }
    }
    &-lang {
        flex-shrink: 0;
        &__picture {
            cursor: pointer;
        }
    }
}
</style>
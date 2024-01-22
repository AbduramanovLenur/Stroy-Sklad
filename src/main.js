import { createApp } from "vue";
import { createPinia } from "pinia";
import axios from "axios";
import router from "@/router/router";
import { createI18n, useI18n } from "vue-i18n";
import { languages } from "@/i18n";
import { defaultLocale } from "@/i18n";
import "@/assets/styles/globals.scss";
import "@/assets/styles/variables.scss";
import "@/assets/fonts/fonts.scss";
import App from "./App.vue";

const app = createApp(App, {
  setup() {
    const { t } = useI18n();
    return { t };
  },
});

app.config.globalProperties.$axios = axios;

const messages = Object.assign(languages);

const localeStorageLang = localStorage.getItem("lang");

const i18n = createI18n({
  legacy: false,
  locale: localeStorageLang || defaultLocale,
  fallbackLocale: "uz",
  messages,
});

app.use(router).use(i18n).use(createPinia());

app.mount("#app");

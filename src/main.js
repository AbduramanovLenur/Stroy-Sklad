import { createApp } from "vue";
import { createPinia } from "pinia";
import axios from "axios";
import { VueQueryPlugin } from "@tanstack/vue-query";
import router from "@/router/router";
import { useI18n } from "vue-i18n";
import { i18n } from "@/i18n";
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

app.use(router).use(i18n).use(createPinia()).use(VueQueryPlugin);

app.mount("#app");

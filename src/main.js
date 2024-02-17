import { createApp } from "vue";
import { createPinia } from "pinia";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { useI18n } from "vue-i18n";
import { i18n } from "@/i18n";
// import axios from "axios";
import Toast from "vue-toastification";
import VueAwesomePaginate from "vue-awesome-paginate";
import router from "@/router/router";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import SwitcherLang from "@/components/SwitcherLang.vue";
import HeadPage from "@/components/HeadPage.vue";
import Title from "@/components/Title.vue";
import FormSearch from "@/components/FormSearch.vue";
import MyButton from "@/components/MyButton.vue";
import Table from "@/components/Table.vue";
import FormInput from "@/components/FormInput.vue";
import FormSelect from "@/components/FormSelect.vue";
import CustomButton from "@/components/CustomButton.vue";
import Spinner from "@/components/Spinner.vue";
import Icon from "@/components/Icon.vue";
import Pagination from "@/components/Pagination.vue";
import ManageHead from "@/components/ManageHead.vue";
import ActionsModules from "@/components/ActionsModules.vue";
import PrimeVue from "primevue/config";
import App from "./App.vue";

import "@/assets/styles/globals.scss";
import "@/assets/styles/variables.scss";
import "@/assets/fonts/fonts.scss";
import "vue-toastification/dist/index.css";

const app = createApp(App, {
  setup() {
    const { t } = useI18n();
    return { t };
  },
});

const pinia = createPinia();

pinia.use(piniaPluginPersistedstate);

const options = {
  queryClientConfig: {
    defaultOptions: { 
      queries: { 
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 60, 
        cacheTime: 1000 * 60 * 60 
      } 
    },
  },
}

// app.config.globalProperties.$axios = axios;

app
  .component("SwitcherLang", SwitcherLang)
  .component("HeadPage", HeadPage)
  .component("Title", Title)
  .component("FormSearch", FormSearch)
  .component("MyButton", MyButton)
  .component("FormInput", FormInput)
  .component("FormSelect", FormSelect)
  .component("Table", Table)
  .component("CustomButton", CustomButton)
  .component("Icon", Icon)
  .component("Spinner", Spinner)
  .component("ManageHead", ManageHead)
  .component("Pagination", Pagination)
  .component("ActionsModules", ActionsModules);

app
  .use(pinia)
  .use(router)
  .use(i18n)
  .use(VueQueryPlugin, options)
  .use(Toast)
  .use(VueAwesomePaginate)
  .use(PrimeVue);

app.mount("#app");

import { createApp } from "vue";
import { createPinia } from "pinia";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { useI18n } from "vue-i18n";
import { i18n } from "@/i18n";
// import axios from "axios";
import Toast from "vue-toastification";
import VueAwesomePaginate from "vue-awesome-paginate";
import router from "@/router/router";

import SwitcherLang from "@/components/SwitcherLang.vue";
import HeadPage from "@/components/HeadPage.vue";
import Title from "@/components/Title.vue";
import FormSearch from "@/components/FormSearch.vue";
import AddButton from "@/components/AddButton.vue";
import Table from "@/components/Table.vue";
import FormInput from "@/components/FormInput.vue";
import FormSelect from "@/components/FormSelect.vue";
import CustomButton from "@/components/CustomButton.vue";
import Spinner from "@/components/Spinner.vue";
import Icon from "@/components/Icon.vue";
import Pagination from "@/components/Pagination.vue";
import PrimeVue from 'primevue/config';
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
  .component("AddButton", AddButton)
  .component("FormInput", FormInput)
  .component("FormSelect", FormSelect)
  .component("Table", Table)
  .component("CustomButton", CustomButton)
  .component("Icon", Icon)
  .component("Spinner", Spinner)
  .component("Pagination", Pagination);

app
  .use(router)
  .use(i18n)
  .use(createPinia())
  .use(VueQueryPlugin, options)
  .use(Toast)
  .use(VueAwesomePaginate)
  .use(PrimeVue);

app.mount("#app");

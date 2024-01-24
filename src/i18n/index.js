import { createI18n } from "vue-i18n";
import uz from "@/i18n/uz.json";
import ru from "@/i18n/ru.json";

const defaultLocale = "uz";

const languages = {
  uz,
  ru,
};

const messages = Object.assign(languages);

const localeStorageLang = localStorage.getItem("lang");

export const i18n = createI18n({
  legacy: false,
  locale: localeStorageLang || defaultLocale,
  fallbackLocale: "uz",
  messages,
});

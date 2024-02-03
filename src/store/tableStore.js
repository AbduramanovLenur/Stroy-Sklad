import { defineStore } from "pinia";
import { ref } from "vue";

export const useTableStore = defineStore("tableStore", () => {
  const page = ref(1);
  const limit = ref(10);
  const search = ref("");

  const setPagePagination = (value) => {
    page.value = value;
  };

  const setLimitPagination = (value) => {
    limit.value = value;
  }

  const setSearchValue = (value) => {
    search.value = value;
  }

  return {
    page,
    limit,
    search,
    setPagePagination,
    setLimitPagination,
    setSearchValue
  };
});

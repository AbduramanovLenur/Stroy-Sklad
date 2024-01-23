import { defineStore } from "pinia";
import { ref } from "vue";

export const useModalsStore = defineStore("modalsStore", () => {
  const isOpenModalForm = ref(false);

  const toggleIsOpenModalForm = () => {
    isOpenModalForm.value = !isOpenModalForm.value;
  };

  return {
    isOpenModalForm,
    toggleIsOpenModalForm,
  };
});

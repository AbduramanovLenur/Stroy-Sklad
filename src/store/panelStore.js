import { defineStore } from "pinia";
import { ref } from "vue";

export const usePanelStore = defineStore("panelStore", () => {
  const isOpen = ref(false);

  const toggleIsOpen = () => {
    isOpen.value = !isOpen.value;
  };

  return {
    isOpen,
    toggleIsOpen
  };
});

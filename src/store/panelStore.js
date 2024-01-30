import { defineStore } from "pinia";
import { ref } from "vue";

export const usePanelStore = defineStore("panelStore", () => {
  const isOpenPanel = ref(false);

  const toggleIsOpenPanel = () => {
    isOpenPanel.value = !isOpenPanel.value;
  };

  return {
    isOpenPanel,
    toggleIsOpenPanel
  };
});

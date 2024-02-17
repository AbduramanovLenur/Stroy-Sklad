import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("userStore", () => {
    const user = ref({});

    const setUser = (payload) => {
        user.value = payload;
    };

    const resetUser = () => {
      console.log(user.value);
        user.value = {};
        console.log(user.value);
    }

    return {
        user,
        setUser,
        resetUser
    };
  },
  {
    persist: true,
  }
);

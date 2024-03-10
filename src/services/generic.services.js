import axios from "axios";
import { useToast } from "vue-toastification";
import { useUserStore } from "@/store/userStore";
import { storeToRefs } from "pinia";
// import { useRouter } from "vue-router";
import { routes } from "@/utils/routes.js";
import router from "@/router/router.js";

const API_URL = import.meta.env.VITE_REQUEST_BASE_URL;

const toast = useToast();
const userStore = useUserStore();
const { resetUser } = userStore;
const { user } = storeToRefs(userStore);

export const request = async ({ url, method, body = {} }) => {
  try {
    axios.defaults.headers.common["Authorization"] = `Bearer ${user.value.token}`;

    const response = await axios[method.toLowerCase()](`${API_URL}/${url}`, body);

    const { data, statusText, status } = response;

    if (method.toLowerCase() === 'post' && status === 200) {
      // toast.success(statusText);
      return { data, success: true };
    }

    return data;
  } catch (error) {
    // if (error.code === "ERR_NETWORK") {
    //   resetUser();
    //   router.push(routes.AUTH.path);
    // }

    toast.error(error.message);
  }
};

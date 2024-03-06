import axios from "axios";
import { useToast } from "vue-toastification";
import { useUserStore } from "@/store/userStore";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { routes } from "@/utils/routes.js";

const API_URL = import.meta.env.VITE_REQUEST_BASE_URL;

const toast = useToast();
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const router = useRouter();

export const request = async ({ url, method, body = {} }) => {
  try {
    axios.defaults.headers.common["Authorization"] = `Bearer ${user.value.token}`;

    const response = await axios[method.toLowerCase()](`${API_URL}/${url}`, body);

    const { data, statusText } = response;

    if (method.toLowerCase() === 'post') {
      toast.success(statusText);
    }

    return data;
  } catch (error) {
    console.error("error", error);
    
    if (error?.response?.status === 401) {
      router.push(routes.AUTH.path);
    }

    toast.error(error.message);
  }
};

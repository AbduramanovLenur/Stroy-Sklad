import axios from "axios";
import { useToast } from "vue-toastification";
import { useUserStore } from "@/store/userStore";
import { storeToRefs } from "pinia";

const API_URL = import.meta.env.VITE_REQUEST_BASE_URL;

const toast = useToast();
const userStore = useUserStore();
const { user } = storeToRefs(userStore);

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
    toast.error(error.message);
  }
};

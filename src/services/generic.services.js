import axios from "axios";
import { useToast } from "vue-toastification";

const API_URL = import.meta.env.VITE_REQUEST_BASE_URL;

const toast = useToast();

export const request = async ({ url, method, body = {} }) => {
  try {
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

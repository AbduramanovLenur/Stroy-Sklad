import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL;

export const request = async ({ url, method, body = {} }) => {
  try {
    const response = await axios({
      method: method.toLowerCase(),
      url: `${API_URL}${url}`,
      body,
    });

    const { data } = response;

    return data;
  } catch (error) {
    console.error(error);
  }
};

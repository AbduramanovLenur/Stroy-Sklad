import { request } from "./generic.services";

export const loginUser = (body) => request({ url: "account/Login", method: "POST", body });
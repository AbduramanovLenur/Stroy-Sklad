import { request } from "./generic.services";

export const loginUser = (body) => request({ url: "api/Account", method: "POST", body });
import { request } from "./generic.services.js";

export const adminGetList = (api) => request({ url: `${api}/GetList`, method: "GET" });

export const adminGetWithId = (api, idx) => request({ url: `${api}/GetById/${idx}`, method: "GET" });

export const adminCreate = (api, body) => request({ url: `${api}/Creat`, method: "POST", body });

export const adminUpdateWithId = (api) => request({ url: `${api}/Update`, method: "POST" });

export const adminDeleteWithId = (api, idx) => request({ url: `${api}/Delete/${idx}`, method: "POST" });
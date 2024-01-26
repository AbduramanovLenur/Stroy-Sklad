import { request } from "./generic.services.js";

export const adminGetList = (api) => request({ url: `${api}/GetList`, method: "GET" });

export const adminGetWithId = (api, idx) => request({ url: `${api}/GetById/id?id=${idx}`, method: "GET" });

export const adminCreate = (api, body) => request({ url: `${api}/Create`, method: "POST", body });

export const adminUpdateById = (api, body) => request({ url: `${api}/Update`, method: "POST", body });

export const adminDeleteWithId = (api, idx) => request({ url: `${api}/Delete/${idx}`, method: "POST" });
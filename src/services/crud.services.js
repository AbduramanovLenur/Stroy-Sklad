import { request } from "./generic.services.js";

export const getList = (api, page, limit, search, isAdmin) => request({ url: `${api}/GetList?page=${page}&limit=${limit}&search=${search}${isAdmin ? `&isAdmin=${isAdmin}` : ''}`, method: "GET" });

export const getWithId = (api, idx) => request({ url: `${api}/GetById/id?id=${idx}`, method: "GET" });

export const create = (api, body) => request({ url: `${api}/Create`, method: "POST", body });

export const updateById = (api, body) => request({ url: `${api}/Update`, method: "POST", body });

export const deleteWithId = (api, idx) => request({ url: `${api}/Delete/${idx}`, method: "POST" });

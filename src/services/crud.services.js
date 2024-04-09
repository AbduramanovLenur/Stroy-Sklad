import { request } from "./generic.services.js"

export const getList = (api, page, limit, search) => request({ url: `${api}/GetList?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`, method: "GET" });

export const getWithId = (api, idx) => request({ url: `${api}/GetById/id?id=${idx}`, method: "GET" });

export const getAll = (api) => request({ url: `${api}/GetAll`, method: "GET" });

export const create = (api, body) => request({ url: `${api}/Create`, method: "POST", body });

export const updateById = (api, body) => request({ url: `${api}/Update`, method: "POST", body });

export const deleteWithId = (api, idx) => request({ url: `${api}/Delete/${idx}`, method: "POST" });

export const cancelWithId = (api, idx, body) => request({ url: `${api}/Cancel/${idx}`, method: "POST", body });

export const acceptWithId = (api, idx, body) => request({ url: `${api}/Accept/${idx}`, method: "POST", body });

export const createWithExcel = (api, body) => request({ url: `${api}/ImportFromExcel`, method: "POST", body });

export const createPositionRoles = (api, body) => request({ url: `${api}/CreateOrUpdate`, method: "POST", body });

export const getReports = (query) => request({ url: `Report/GetReportData${query ? query : ''}`, method: "GET" });

export const exportWithExcel = (query) => request({ url: `Report/ReportAsExcel${query ? query : ''}`, method: "POST", body: {}, headers: { responseType: 'blob' } });

export const uploadInvoice = (body) => request({ url: "application/UploadInvoiceDocument", method: "POST", body, headers: { "Content-Type": "multipart/form-data" } });

export const downloadFile = (idx) => request({ url: `application/DownloadDocument?materialFactoryId=${idx}`, method: "POST", body: {}, headers: { responseType: 'blob' } });

export const chooseMaterialFactory = (idx) => request({ url: `application/ChooseMaterialFactory?materialFactoryId=${idx}`, method: "POST", body: {} });
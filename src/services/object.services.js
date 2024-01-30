import { request } from "./generic.services";

export const objectGetList = () => request({ url: "building_object/GetList", method: "GET" });

export const objectDeleteWithId = (idx) => request({ url: `building_object/Delete/${idx}`, method: "POST" });

import { request } from "./generic.services";

export const manualGetRegions = () => request({ url: "manual/RegionSelectList", method: "GET" });

export const manualGetDistricts = () => request({ url: "manual/DistrictSelectList", method: "GET" });

export const manualGetOrganizations = () => request({ url: "manual/OrganizationSelectList", method: "GET" });

export const manualGetRoles = () => request({ url: "manual/RoleSelectList", method: "GET" });

export const manualGetStates = () => request({ url: "manual/StateSelectList", method: "GET" });
import { request } from "./generic.services";

export const manualGetRegions = () => request({ url: "manual/RegionSelectList", method: "GET" });

export const manualGetDistricts = (idx) => request({ url: `manual/DistrictSelectListFromId/regionId?regionId=${idx}`, method: "GET" });

export const manualGetOrganizations = () => request({ url: "manual/OrganizationSelectList", method: "GET" });

export const manualGetRoles = () => request({ url: "manual/RoleSelectList", method: "GET" });

export const manualGetStates = () => request({ url: "manual/StateSelectList", method: "GET" });

export const manualQuantityTypes = () => request({ url: "manual/QuantityTypeSelectList", method: "GET" });

export const manualGetFloors = () => request({ url: "manual/FloorSelectList", method: "GET" });

export const manualConstructionMaterial = (idx) => request({ url: `manual/ConstructionMaterialSelectList/organizationId?organizationId=${idx}`, method: "GET" });

export const manualGetObjects = (idx) => request({ url: `manual/BuildingObjectSelectList/organizationId?organizationId=${idx}`, method: "GET" });

export const manualGetCost = (idx) => request({ url: `manual/CostSelectList?organizationId=${idx}`, method: "GET" });

export const manualGetBlocks = (idx) => request({ url: `manual/BuildingBlockSelectList?buildingObjectId=${idx}`, method: "GET" });
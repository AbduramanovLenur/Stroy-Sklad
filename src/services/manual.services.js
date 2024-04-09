import { request } from "./generic.services"

export const manualGetRegions = () => request({ url: "manual/RegionSelectList", method: "GET" });

export const manualGetDistricts = (idx) => request({ url: `manual/DistrictSelectListFromId/regionId?regionId=${idx}`, method: "GET" });

export const manualGetOrganizations = () => request({ url: "manual/OrganizationSelectList", method: "GET" });

export const manualGetRoles = () => request({ url: "manual/RoleSelectList", method: "GET" });

export const manualGetStates = () => request({ url: "manual/StateSelectList", method: "GET" });

export const manualQuantityTypes = (idx) => request({ url: `manual/QuantityTypeSelectList${idx ? `?materialId=${idx}` : ''}`, method: "GET" });

export const manualGetFloors = (idx) => request({ url: `manual/FloorSelectList?buildingBlockId=${idx}`, method: "GET" });

export const manualConstructionMaterial = () => request({ url: "manual/ConstructionMaterialSelectList", method: "GET" });

export const manualGetObjects = () => request({ url: "manual/BuildingObjectSelectList", method: "GET" });

export const manualGetCost = () => request({ url: "manual/CostSelectList", method: "GET" });

export const manualGetBlocks = (idx) => request({ url: `manual/BuildingBlockSelectList?buildingObjectId=${idx}`, method: "GET" });

export const manualGetModules = () => request({ url: "manual/ModuleSubGroupSelectList", method: "GET" });

export const manualGetPositionRoles = (body) => request({ url: "manual/RoleForPositionSelectList", method: "POST", body });

export const manualGetWarehouse = () => request({ url: "manual/WarehouseSelectList", method: "GET" });

export const manualGetMaterialFactory = (idx) => request({ url: `manual/MaterialFactorySelectList?applicationTableId=${idx}`, method: "GET" });
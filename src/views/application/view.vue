<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="addNewApplicationTitle" 
                :to="routes.APPLICATION.path"
            />
            <form v-if="isSuccess" class="manage__form" @submit.prevent>
                <div class="manage__overlay">
                    <template v-for="field in fields" :key="field.id">
                        <FormInput 
                            v-if="!field?.select"
                            v-model="state[field.model]"
                            :placeholder="$t(field.placeholder)"
                            :name="field.icon"
                            :type="field?.type"
                            :isDisabled="true"
                        >
                            {{ $t(field.label) }}
                        </FormInput>
                        <FormSelect 
                            v-if="field?.select"
                            v-model.trim="state[field.model]" 
                            :options="field.options"
                            :placeholder="field?.placeholder"
                            :success="field.success"
                            :loading="field.loading"
                            :isDisabled="true"
                        >
                            {{ $t(field.label) }}
                        </FormSelect>
                    </template>
                </div>
                <SubTable
                    :headers="headers"
                    :table="state.applicationTables"
                    :isShowFields="isShowManageField"
                    :isShowFileManage="user?.user?.modules?.includes(actionModules.MATERIAL_INVOICE.CREATE) && state.hasPermission"
                    :isShowFile="user?.user?.modules?.includes(actionModules.MATERIAL_INVOICE.READ) && hasFile"
                    @onActionAdd="actionAddHandler"
                    @onDownload="downloadMutate"
                />
                <CustomButton 
                    v-if="user?.user?.modules?.includes(actionModules.MATERIAL_FACTORY.CREATE) && state.hasPermission"
                    type="button" 
                    :width="200"
                    className="margened"
                    :isDisabled="updateStatus === 'pending'"
                    @click="updateHandler"
                >
                    {{ $t("formButton") }}
                </CustomButton>
                <div class="manage__textareas">
                    <FormTextarea
                        v-model.trim="state.details"
                        :width="500" 
                        :placeholder="$t('appDetailsPlaceholder')"
                        :isDisabled="true"
                    >
                        {{ $t("appDetailsLabel") }}
                    </FormTextarea>
                    <FormTextarea 
                        v-model.trim="state.comment"
                        :width="500" 
                        :placeholder="$t('appCommentPlaceholder')"
                        :isDisabled="!state.hasPermission"
                    >
                        {{ $t("appCommentLabel") }}
                    </FormTextarea>
                </div>
                <!-- (state.statusId !== 7 && state.statusId !== 15) &&  -->
                <div 
                    v-if="state.hasPermission"
                    class="manage__triggers" 
                >
                    <MyButton 
                        v-if="user?.user?.modules?.includes(actionModules.APPLICATION.CONFIRM)"
                        className="not-margened"
                        icon="approve" 
                        type="submit" 
                        color="green" 
                        :width="180" 
                        @click="() => isOpenAcceptedModal = true"
                        :disabled="approveStatus === 'pending'"
                    >
                        {{ $t("acceptButton") }}
                    </MyButton>
                    <MyButton 
                        v-if="user?.user?.modules?.includes(actionModules.APPLICATION.REFUSAL)"
                        className="not-margened"
                        icon="refusal" 
                        type="submit" 
                        color="red" 
                        :width="180" 
                        @click="() => isOpenRefusedModal = true"
                        :disabled="refusalStatus === 'pending'"
                    >
                        {{ $t("cancelButton") }}
                    </MyButton>
                </div>
                <Histories :histories="state.histories" />
            </form>
            <Spinner v-if="isLoading" />
        </div>
        <ConfirmationModal 
            :isOpen="isOpenAcceptedModal"
            @onConfirmed="acceptHandler" 
            @onNotConfirmed="() => isOpenAcceptedModal = false"
        >
            {{ $t("sureConfirm") }}
        </ConfirmationModal>
        <ConfirmationModal 
            :isOpen="isOpenRefusedModal"
            @onConfirmed="cancelHandler" 
            @onNotConfirmed="() => isOpenRefusedModal = false"
        >
            {{ $t("sureRefused") }}
        </ConfirmationModal>
        <OverlayModal 
            v-if="isShowManageField"
            :isOpen="isOpenModal === 'fields'"
            :width="1500"
            @onCloseModal="closeModalHandler"
        >
            <div v-if="isShowManageField" class="modal__companies">
                <div v-if="user?.user?.modules?.includes(actionModules.MATERIAL_FACTORY.CREATE)" class="modal__head">
                    <template v-for="subField in subFields" :key="subField.id">
                        <FormInput
                            v-model="companiesState[subField.model]"
                            :placeholder="$t(subField.placeholder)"
                            :name="subField.icon"
                            :type="subField?.type"
                            :isDisabled="!user?.user?.modules?.includes(actionModules.MATERIAL_FACTORY.CREATE)"
                        >
                            {{ $t(subField.label) }}
                        </FormInput>
                    </template>
                </div>
                <SubTable
                    v-if="isShowManageField"
                    :headers="subHeaders"
                    :table="filteredAdditionallyState"
                    className="subtable-action"
                    :isShowDelete="user?.user?.modules?.includes(actionModules.MATERIAL_FACTORY.CREATE)"
                    :isShowSelected="user?.user?.modules?.includes(actionModules.MATERIAL_FACTORY.CONFIRM)"
                    @onActionDelete="deleteHandler"
                    @onSelected="($event) => chooseMutate($event)"
                />
            </div>
            <CustomButton 
                v-if="user?.user?.modules?.includes(actionModules.MATERIAL_FACTORY.CREATE) && state.hasPermission"
                type="button" 
                className="companies-add"
                @click="addCompaniesHandler"
            >
                {{ $t("addButton") }}
            </CustomButton>
        </OverlayModal>
        <OverlayModal 
            v-if="isShowManageFile && state.hasPermission"
            :isOpen="isOpenModal === 'upload'"
            :width="500"
            @onCloseModal="closeModalHandler"
        >
            <div class="modal__file-wrapper">
                <FormFile
                    v-if="user?.user?.modules?.includes(actionModules.MATERIAL_INVOICE.CREATE)"
                    :width="250" 
                    accept="application/pdf"
                    @onChangFile="handleFileUpload"
                >
                    {{ $t("fileUploadFile") }}
                </FormFile>
                <div v-if="invoiceState.uploadFile && user?.user?.modules?.includes(actionModules.MATERIAL_INVOICE.CREATE)" class="modal__file-overlay">
                    <div 
                        class="modal__file-delete"
                        @click="() => invoiceState.uploadFile = null"
                    >
                        <Icon name="circle-close" />
                    </div>
                    <div                           
                        class="modal__file-download" 
                        @click="downloadHandler"
                    >
                        <div class="modal__file-icon">
                            <Icon name="file-download" />
                        </div>
                        <div class="modal__file-text">
                            invoice.pdf
                        </div>
                    </div>
                </div>
            </div>
            <CustomButton 
                v-if="user?.user?.modules?.includes(actionModules.MATERIAL_INVOICE.CREATE)"
                type="button" 
                :isDisabled="uploadStatus === 'pending'"
                @click="uploadHandler"
            >
                {{ $t("formButton") }}
            </CustomButton>
        </OverlayModal>
    </section>
</template>

<script setup>
import ConfirmationModal from "@/components/ConfirmationModal.vue"
import FormFile from "@/components/FormFile.vue"
import FormTextarea from "@/components/FormTextarea.vue"
import Histories from "@/components/Histories.vue"
import OverlayModal from "@/components/OverlayModal.vue"
import {
    acceptWithId,
    cancelWithId,
    downloadFile,
    getWithId,
    updateById,
    uploadInvoice,
    chooseMaterialFactory
} from "@/services/crud.services.js"
import {
    manualConstructionMaterial,
    manualGetBlocks,
    manualGetCost,
    manualGetFloors,
    manualGetObjects
} from "@/services/manual.services.js"
import { useUserStore } from "@/store/userStore"
import { actionModules } from "@/utils/action-modules.js"
import { routes } from "@/utils/routes.js"
import { createIdMap } from "@/utils/secondary-functions.js"
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query"
import { storeToRefs } from "pinia"
import { v4 as uuidv4 } from "uuid"
import { computed, onMounted, ref, watch, watchEffect } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"
import { useToast } from "vue-toastification"

const queryClient = useQueryClient();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const { t } = useI18n();

const slugId = ref(route.params.id);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShow = computed(() => user?.value.user?.modules?.includes(actionModules.APPLICATION.READ));
const isShowManageField = computed(() => 
    user?.value?.user?.modules?.includes(actionModules.MATERIAL_FACTORY.CREATE) || 
    user?.value?.user?.modules?.includes(actionModules.MATERIAL_FACTORY.READ)
);
const isShowManageFile = computed(() => 
    user?.value?.user?.modules?.includes(actionModules.MATERIAL_INVOICE.CREATE) || 
    user?.value?.user?.modules?.includes(actionModules.MATERIAL_INVOICE.READ)
);

const isOpenAcceptedModal = ref(false);
const isOpenRefusedModal = ref(false);

const headers = ref([
    { id: 1, label: "appFloor", width: 20 },
    { id: 2, label: "appMaterial", width: 30 },
    { id: 3, label: "appType", width: 10 },
    { id: 4, label: "appCount", width: 20 },
    { id: 5, label: "appPrice", width: 30 }
]);

const subHeaders = ref([
    { id: 1, label: "appCompanyLabel", width: 30 },
    { id: 2, label: "appCount", width: 30 },
    { id: 3, label: "priceAppLabel", width: 30 },
])

const state = ref({
    id: "",
    deadline: "",
    buildingObjectId: [],
    buildingBlockId: [],
    applicationTables: [],
    details: "",
    comment: "",
    statusId: "",
    hasPermission: [],
    histories: []
});

const companiesState = ref({
    applicationTableId: "",
    factoryName: "",
    count: "",
    price: ""
});

const invoiceState = ref({
    applicationTableId: "",
    uploadFile: ""
});

const additionallyState = ref([]);

const filteredAdditionallyState = computed(() => 
    additionallyState.value.filter((elem) => elem.applicationTableId === companiesState.value.applicationTableId)
);

const isOpenModal = ref(false);

const {
    data: objects,
    isSuccess: isSuccessObjects,
    isLoading: isLoadingObjects
} = await useQuery({
    queryKey: ["objectsList", { 
        organizationId: user.value.user.organizationId,
        name: user.value.user.fullName
    }],
    queryFn: () => manualGetObjects(),
    enabled: isShow
});

const valueObject = computed(() => state.value.buildingObjectId[0]);

const isEnabledBlocks = computed(() => !!valueObject.value);

const {
    data: blocks,
    isSuccess: isSuccessBlocks,
    isLoading: isLoadingBlocks
} = await useQuery({
    queryKey: ["blocksList", { 
        blockId: valueObject, 
        organizationId: user.value.user.organizationId,
        name: user.value.user.fullName
    }],
    queryFn: () => manualGetBlocks(valueObject.value),
    enabled: isEnabledBlocks
});

const valueBlock = computed(() => state.value.buildingBlockId[0]);

const isEnabledFloors = computed(() => !!valueBlock.value);

const {
    data: floors,
    isSuccess: isSuccessFloors,
    isLoading: isLoadingFloors
} = await useQuery({
    queryKey: ["floorsList", { 
        floorId: valueBlock, 
        organizationId: user.value.user.organizationId,
        name: user.value.user.fullName
    }],
    queryFn: () => manualGetFloors(valueBlock.value),
    enabled: isEnabledFloors
});

const {
    data: costs,
    isSuccess: isSuccessCosts,
    isLoading: isLoadingCosts
} = await useQuery({
    queryKey: ["costsList", { 
        organizationId: user.value.user.organizationId,
        name: user.value.user.fullName
    }],
    queryFn: () => manualGetCost(),
    enabled: isShow
});

const {
    data: materials,
    isSuccess: isSuccessMaterials,
    isLoading: isLoadingMaterials
} = await useQuery({
    queryKey: ["materialsList", { 
        organizationId: user.value.user.organizationId,
        name: user.value.user.fullName
    }],
    queryFn: () => manualConstructionMaterial(),
    enabled: isShow
});

const fields = ref([
    { 
        id: 1, 
        model: "deadline", 
        label: "dateAppLabel", 
        placeholder: "dateAppPlaceholder", 
        icon: "date",
        errorKey: "deadline",
        type: "date"
    },
    { 
        id: 2, 
        model: "buildingObjectId", 
        label: "objectAppLabel", 
        placeholder: "objectAppPlaceholder",
        errorKey: "buildingObjectId",
        options: objects,
        success: isSuccessObjects,
        loading: isLoadingObjects,
        select: true
    },
    { 
        id: 3, 
        model: "buildingBlockId", 
        label: "blockAppLabel", 
        placeholder: "blockAppPlaceholder",
        errorKey: "buildingBlockId",
        options: blocks,
        success: isSuccessBlocks,
        loading: isLoadingBlocks,
        select: true
    }
]);

const subFields = ref([
    { 
        id: 1, 
        model: "factoryName", 
        label: "appCompanyLabel", 
        placeholder: "appCompanyPlaceholder", 
        icon: "input-company"
    },
    { 
        id: 2, 
        model: "count", 
        label: "countAppLabel", 
        placeholder: "countAppPlaceholder", 
        icon: "list",
        type: "number"
    },
    { 
        id: 3, 
        model: "price", 
        label: "appBudgetLabel", 
        placeholder: "appBudgetPlaceholder", 
        icon: "money",
        type: "number"
    },
]);

const { isError } = await useQuery({
    queryKey: ["applicationsById", slugId, user.value.user.fullName],
    queryFn: () => getWithId("application", slugId.value),
    select: (data) => {
        if (data.notViewed) {
            queryClient.invalidateQueries({ queryKey: ["applications"] });
            queryClient.invalidateQueries({ queryKey: ["applicationsById", slugId] });
        }

        state.value.id = data.id;
        state.value.deadline = data.deadline;
        state.value.buildingObjectId = [data.buildingObjectId];
        state.value.buildingBlockId = [data.buildingBlockId];
        state.value.applicationTables = [...data.applicationTables];
        state.value.details = data.details;
        state.value.statusId = data.statusId;
        state.value.hasPermission = data.hasPermission;
        state.value.histories = data.applicationHistories;

        additionallyState.value = [];

        data.applicationTables.forEach((elem) => {
            const { materialFactory } = elem;

            materialFactory.forEach((element) => {
                additionallyState.value.push({
                    applicationTableId: elem.id,
                    id: element.id,
                    factoryName: element.factoryName,
                    count: element.count,
                    price: element.price,
                    isChoosed: element.isChoosed,
                    delId: uuidv4()
                });
            });
        });
    },
    enabled: isShow
});

const hasFile = computed(() => state.value.applicationTables.every((elem) => elem.resourceId));

const floorMap = computed(() => createIdMap(floors.value || []));
const costMap = computed(() => createIdMap(costs.value || []));
const materialMap = computed(() => createIdMap(materials.value || []));

const getFloorIdValue = (elem) => floorMap.value[elem.floorId]?.name;
const getCostIdValue = (elem) => costMap.value[elem.costId]?.name;
const getConstructionMaterialIdValue = (elem) => materialMap.value[elem?.constructionMaterialId]?.name;

const isSuccess = ref(false);
const isLoading = ref(true);
const isInitialRender = ref(true);

watchEffect(() => {
    const keysFloor = Object.keys(floorMap.value)?.length;
    const keysCost = Object.keys(costMap.value)?.length;
    const keysMaterial =  Object.keys(materialMap.value)?.length;
    const applicationTables = state.value.applicationTables.length;

    if (!!(keysFloor && keysCost && keysMaterial && applicationTables && isInitialRender)) {
        state.value.applicationTables = state.value.applicationTables.map((elem) => {
            const object = { 
                ...elem,
                floorValue: getFloorIdValue(elem),
                costValue: getCostIdValue(elem),
                constructionMaterialValue: getConstructionMaterialIdValue(elem),
                typeValue: materials.value?.filter((element) => element?.id === elem.constructionMaterialId)?.[0]?.quantityType
            };

            delete object.price;

            return object;
        });

        isSuccess.value = true;
        isLoading.value = false;
        isInitialRender.value = false;
    }
});

watch(isError, (value) => {
    if (value) {
        router.push(routes.APPLICATION.path);
    }
});

const { mutate: updateMutate, status: updateStatus } = useMutation({
    mutationFn: (body) => updateById("application", body),
    onSuccess: (response) => {
        if (!response?.success) return;

        queryClient.invalidateQueries({ queryKey: ["applicationsById", slugId] });

        setTimeout(() => toast.success(t("updateToast")), 150);
    }
});

const { mutate: uploadMutate, status: uploadStatus } = useMutation({
    mutationFn: (body) => uploadInvoice(body),
    onSuccess: (response) => {
        if (!response?.success) return;

        queryClient.invalidateQueries({ queryKey: ["applicationsById", slugId] });

        setTimeout(() => toast.success(t("updateToast")), 150);
    }
});

const { mutate: cancelMutate, status: refusalStatus } = useMutation({
    mutationFn: (idx) => cancelWithId("application", idx, { comment: state.value.comment }),
    onSuccess: (response) => {
        if (!response?.success) return;

        queryClient.invalidateQueries({ queryKey: ["applications"] });
        queryClient.invalidateQueries({ queryKey: ["applicationsById", slugId] });

        router.push(routes.APPLICATION.path);

        setTimeout(() => toast.success(t("cancelToast")), 150);
    }
});

const { mutate: acceptMutate, status: approveStatus } = useMutation({
    mutationFn: (idx) => acceptWithId("application", idx, { comment: state.value.comment }),
    onSuccess: (response) => {
        if (!response?.success) return;

        if (response.isRefresh) {
            queryClient.invalidateQueries({ queryKey: ["warehouse"] });
            queryClient.invalidateQueries({ queryKey: ["warehouseById"] });
            queryClient.invalidateQueries({ queryKey: ["reports", "warehouse"] });
        }

        queryClient.invalidateQueries({ queryKey: ["applications"] });
        queryClient.invalidateQueries({ queryKey: ["applicationsById", slugId] });

        router.push(routes.APPLICATION.path);

        setTimeout(() => toast.success(t("acceptToast")), 150);
    }
});

const { mutate: downloadMutate } = useMutation({
    mutationFn: (idx) => downloadFile(idx),
    onSuccess: (response) => {
        if (!response?.success) return;

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'invoice.pdf');
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);

        setTimeout(() => toast.success(t("downloadToast")), 150);
    }
});

const { mutate: chooseMutate } = useMutation({
    mutationFn: (idx) => chooseMaterialFactory(idx),
    onSuccess: (response) => {
        if (!response?.success) return;

        queryClient.invalidateQueries({ queryKey: ["applications"] });
        queryClient.invalidateQueries({ queryKey: ["applicationsById", slugId] });
    }
});

const actionAddHandler = (idx, flag) => {
    isOpenModal.value = flag;
    document.body.style.overflowY = "hidden";

    if (flag === 'fields') {
        companiesState.value.applicationTableId = idx;
        return;
    }
    
    invoiceState.value.applicationTableId = idx;
}

const addCompaniesHandler = () => {
    const keys = Object.keys(companiesState.value);
    const isExistValue = keys.every((key) => companiesState.value[key]);

    if (!isExistValue) return;

    additionallyState.value.push({ 
        applicationTableId: companiesState.value.applicationTableId,
        count: +companiesState.value.count,
        price: +companiesState.value.price,
        factoryName: companiesState.value.factoryName,
        delId: uuidv4()
    });

    keys.forEach(elem => {
        if (elem !== 'applicationTableId') companiesState.value[elem] = "";
    });
}

const handleFileUpload = (file) => {
    invoiceState.value.uploadFile = file;
}

const closeModalHandler = () => {
    document.body.style.overflowY = "auto";
    const stateToClear = isOpenModal.value === 'fields' ? companiesState.value : invoiceState.value;
    
    Object.keys(stateToClear).forEach(elem => {
        stateToClear[elem] = "";
    });

    isOpenModal.value = false;
}

const downloadHandler = () => {
    const file = invoiceState.value.uploadFile;

    const blob = new Blob([file]);

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', "invoice.pdf");
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
    setTimeout(() => toast.success(t("downloadToast")), 150);
}

const updateHandler = () => {
    let materialFactoryDtos = [...additionallyState.value];

    materialFactoryDtos = materialFactoryDtos.map((elem) => {
        const object = { ...elem };

        delete object.delId;

        return object;
    });

    updateMutate({ materialFactoryDtos })
}

const uploadHandler = () => {
    const formData = new FormData();

    formData.append('ApplicationTableId', invoiceState.value.applicationTableId);
    formData.append('UploadFile', invoiceState.value.uploadFile);

    uploadMutate(formData);
}

const deleteHandler = (idx) => additionallyState.value = additionallyState.value.filter((elem) => elem.delId !== idx);

const cancelHandler = () => cancelMutate(slugId.value);

const acceptHandler = () => acceptMutate(slugId.value);
</script>

<style lang="scss" scoped>
.modal {
    &__companies {
        width: 100%;
    }
    &__head {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        margin-bottom: 25px;
        @media (max-width: 1024px) {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
        }
        @media (max-width: 768px) {
            grid-template-columns: repeat(1, 1fr);
        }
    }
    &__file {
        &-wrapper {
            display: flex;
            align-items: flex-end;
            gap: 20px;
            width: 100%;
        }
        &-overlay {
            position: relative;
        }
        &-download {
            display: flex;
            flex-direction: column;
            align-items: center;
            border: 1px solid var(--black);
            border-radius: 5px;
            padding: 5px;
            cursor: pointer;
        }
        &-delete {
            position: absolute;
            top: -5px;
            left: -5px;
        }
    }
}
.manage {
    &__overlay {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 30px 50px;
        margin-top: 20px;
        margin-bottom: 50px;
        @media (max-width: 1536px) {
            gap: 20px;
        }
        @media (max-width: 1152px) {
            grid-template-columns: repeat(2, 1fr);
        }
        @media (max-width: 864px) {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
    }
    &__triggers {
        display: flex;
        align-items: center;
        gap: 30px;
        margin-top: 30px;
        @media (max-width: 640px) {
            flex-direction: column;
            gap: 20px;
        }
    }
    &__textareas {
        display: flex;
        align-items: center;
        gap: 20px;
        @media (max-width: 1024px) {
            flex-direction: column;
            align-items: flex-start;
        }
    }
}
</style>
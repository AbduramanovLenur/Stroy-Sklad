<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="addNewApplicationTitle" 
                :to="routes.APPLICATION.path"
            />
            <form class="manage__form" @submit.prevent="submitHandler">
                <div class="manage__overlay">
                    <template v-for="field in fields" :key="field.id">
                        <FormInput 
                            v-if="!field?.select"
                            v-model="state[field.model]"
                            :placeholder="$t(field.placeholder)"
                            :name="field.icon"
                            :error="v$?.[field.errorKey]?.$error" 
                            :textError="v$?.[field.errorKey]?.$errors[0]?.$message"
                            :type="field?.type"
                        >
                            {{ $t(field.label) }}
                        </FormInput>
                        <FormSelect 
                            v-if="field?.select"
                            v-model.trim="state[field.model]" 
                            :options="field.options"
                            :error="v$?.[field?.errorKey]?.$error" 
                            :placeholder="field?.placeholder"
                            :textError="v$?.[field?.errorKey]?.$errors[0]?.$message"
                            :success="field.success"
                            :loading="field.loading"
                            :isMultiSelect="field?.multiple"
                        >
                            {{ $t(field.label) }}
                        </FormSelect>
                    </template>
                </div>
                <ApplicationForm 
                    :subFields="subFields"
                    :buildingBlockId="state.buildingBlockId"
                    :isSubmit="isSubmit"
                    @onAddTable="addTableHandler"
                />
                <span 
                    v-if="v$?.createApplicationTables?.$error" 
                    class="error"
                >
                    {{ v$?.createApplicationTables?.$errors[0]?.$message }}
                </span>
                <SubTable
                    :headers="headers"
                    :table="state.createApplicationTables"
                    @onActionDelete="deleteHandler"
                    :isShowDelete="true"
                />
                <div class="manage__textareas">
                    <FormTextarea 
                        v-model.trim="state.details"
                        :width="500" 
                        :placeholder="$t('appDetailsPlaceholder')"
                        :error="v$?.details?.$error" 
                        :textError="v$?.details?.$errors[0]?.$message"
                    >
                        {{ $t("appDetailsLabel") }}
                    </FormTextarea>
                    <FormTextarea 
                        v-model.trim="state.comment"
                        :width="500" 
                        :placeholder="$t('appCommentPlaceholder')"
                        :error="v$?.comment?.$error" 
                        :textError="v$?.comment?.$errors[0]?.$message"
                    >
                        {{ $t("appCommentLabel") }}
                    </FormTextarea>
                </div>
                <CustomButton 
                    className="manage__submit"
                    :disabled="status === 'pending'"
                >
                    {{ $t("appButton") }}
                </CustomButton>
            </form>
        </div>
    </section>
</template>

<script setup>
import ApplicationForm from "@/components/ApplicationForm.vue"
import { create } from "@/services/crud.services.js"
import {
    manualConstructionMaterial,
    manualGetBlocks,
    manualGetCost,
    manualGetFloors,
    manualGetObjects
} from "@/services/manual.services.js"
import { useUserStore } from "@/store/userStore"
import { actionModules } from "@/utils/action-modules.js"
import { required } from "@/utils/i18n-validators.js"
import { routes } from "@/utils/routes.js"
import { clearState, createIdMap } from "@/utils/secondary-functions.js"
import {
    useMutation,
    useQuery,
    useQueryClient
} from "@tanstack/vue-query"
import { useVuelidate } from "@vuelidate/core"
import { storeToRefs } from "pinia"
import { v4 as uuidv4 } from "uuid"
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { useToast } from "vue-toastification"

const queryClient = useQueryClient();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShow = computed(() => !!user?.value.user?.modules?.includes(actionModules.APPLICATION.CREATE));

const isSubmit = ref(false);

const headers = ref([
    { id: 1, label: "appFloor", width: 15 },
    { id: 2, label: "appMaterial", width: 30 },
    { id: 3, label: "appType", width: 10 },
    { id: 4, label: "appCount", width: 15 },
    { id: 5, label: "appPrice", width: 20 },
]);

const state = ref({
    deadline: "",
    buildingObjectId: [],
    buildingBlockId: [],
    createApplicationTables: [],
    details: "",
    comment: ""
});

const rules = computed(() => ({
    deadline: { required },
    buildingObjectId: { required },
    buildingBlockId: { required },
    createApplicationTables: { required },
    details: { required },
    comment: { required }
}));

const v$ = useVuelidate(rules, state);

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

const valueObject = computed(() => state.value.buildingObjectId);

const isEnabledBlocks = computed(() => !!valueObject.value.length);

watch(valueObject, () => {
    if (!isSubmit.value) {
        state.value.buildingBlockId = [];
    }
}, { immediate: true });

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

const valueBlock = computed(() => state.value.buildingBlockId);

const isEnabledFloors  = computed(() => !!valueBlock.value.length);

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
        model: "floorId", 
        label: "floorsAppLabel", 
        placeholder: "floorsAppPlaceholder",
        options: floors,
        success: isSuccessFloors,
        loading: isLoadingFloors,
        select: true
    },
    { 
        id: 2, 
        model: "costId", 
        label: "costAppLabel", 
        placeholder: "costAppPlaceholder",
        options: costs,
        success: isSuccessCosts,
        loading: isLoadingCosts,
        select: true
    },
    { 
        id: 3, 
        model: "constructionMaterialId", 
        label: "materialsAppLabel", 
        placeholder: "materialsAppPlaceholder",
        options: materials,
        success: isSuccessMaterials,
        loading: isLoadingMaterials,
        select: true
    },
    { 
        id: 4, 
        model: "count", 
        label: "countAppLabel", 
        placeholder: "countAppPlaceholder", 
        icon: "list"
    }
]);

const floorMap = computed(() => createIdMap(floors.value));
const costMap = computed(() => createIdMap(costs.value));
const materialMap = computed(() => createIdMap(materials.value));

const getFloorIdValue = (elem) => floorMap.value[elem.floorId]?.name;
const getCostIdValue = (elem) => costMap.value[elem.costId]?.name;
const getConstructionMaterialIdValue = (elem) => materialMap.value[elem?.constructionMaterialId]?.name;

const addTableHandler = (object) => {
    state.value.createApplicationTables.push({ 
        ...object,
        delId: uuidv4(), 
        floorValue: getFloorIdValue(object),
        costValue: getCostIdValue(object),
        constructionMaterialValue: getConstructionMaterialIdValue(object),
        typeValue: materials.value?.filter((elem) => elem?.id === object.constructionMaterialId)?.[0]?.quantityType
    });
}

const deleteHandler = (idx) => {
    state.value.createApplicationTables = state.value.createApplicationTables.filter((elem) => elem.delId !== idx);
}

const { mutate: createMutate, status } = useMutation({
    onMutate: (body) => {
        isSubmit.value = true;

        body.buildingObjectId = body.buildingObjectId[0];
        body.buildingBlockId = body.buildingBlockId[0];

        body.createApplicationTables = body.createApplicationTables.map((elem) => {
            const { 
                delId, 
                floorValue, 
                costValue, 
                constructionMaterialValue, 
                typeValue,
                ...rest 
            } = elem;

            return rest;
        });
    },
    mutationFn: (body) => create("application", body),
    onSuccess: (response) => {
        if (!response?.success) return;

        state.value = clearState(state.value);

        queryClient.invalidateQueries({ queryKey: ["applications"] });
        
        router.push(routes.APPLICATION.path);

        setTimeout(() => toast.success(t("createToast")), 150);
    }
});

const submitHandler = () => {
    v$.value.$validate();

    if (v$.value.$errors.length) {
        return;
    }

    const formData = { ...state.value };

    createMutate(formData);

    v$.value.$reset();
}
</script>

<style lang="scss" scoped>
.manage {
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
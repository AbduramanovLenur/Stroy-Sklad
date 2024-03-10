<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="addNewApplicationTitle" 
                :to="routes.APPLICATION.path"
            />
            <form class="manage__form" @submit.prevent="submitHandler">
                <div class="manage__overlay">
                    <FormInput 
                        v-for="input in inputs"
                        :key="input.id"
                        v-model="state[input.model]"
                        :width="500" 
                        :placeholder="$t(input.placeholder)"
                        :name="input.icon"
                        :error="v$?.[input.errorKey]?.$error" 
                        :textError="v$?.[input.errorKey]?.$errors[0]?.$message"
                        :type="input?.type"
                    >
                        {{ $t(input.label) }}
                    </FormInput>
                    <FormSelect 
                        v-for="select in selects"
                        :key="select.id"
                        v-model.trim="state[select.model]" 
                        :width="500" 
                        :options="select.options"
                        :error="v$?.[select?.errorKey]?.$error" 
                        :placeholder="select?.placeholder"
                        :textError="v$?.[select?.errorKey]?.$errors[0]?.$message"
                        :success="select.success"
                        :loading="select.loading"
                        :isMultiSelect="select?.multiple"
                    >
                        {{ $t(select.label) }}
                    </FormSelect>
                </div>
                <ApplicationForm 
                    :selects="selectsInfo"
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
                <FormTextarea 
                    v-model.trim="state.details"
                    :width="500" 
                    :placeholder="$t('appCommentPlaceholder')"
                    :error="v$?.details?.$error" 
                    :textError="v$?.details?.$errors[0]?.$message"
                >
                    {{ $t("appCommentLabel") }}
                </FormTextarea>
                <CustomButton className="manage__submit">
                    {{ $t("appButton") }}
                </CustomButton>
            </form>
        </div>
    </section>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";
import { ref, computed, watch } from "vue";
import ApplicationForm from "@/components/ApplicationForm.vue";
import { useRouter } from "vue-router";
import { useVuelidate } from "@vuelidate/core";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/userStore";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { required } from "@/utils/i18n-validators.js";
import { 
    useQueryClient, 
    useQuery, 
    useMutation 
} from "@tanstack/vue-query";
import { create } from "@/services/crud.services.js";
import { 
    manualConstructionMaterial, 
    manualGetFloors, 
    manualGetCost, 
    manualGetObjects, 
    manualGetBlocks,
    // manualGetRoles
} from "@/services/manual.services.js";
import { routes } from "@/utils/routes.js";
import { actionModules } from "@/utils/action-modules.js";
import { createIdMap, clearState } from "@/utils/secondary-functions.js";

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
    { id: 3, label: "appCount", width: 15 },
    { id: 4, label: "appPrice", width: 20 }
]);

const state = ref({
    deadline: "",
    buildingObjectId: [],
    buildingBlockId: [],
    // roleIds: [],
    createApplicationTables: [],
    details: ""
});

const rules = computed(() => ({
    deadline: { required },
    buildingObjectId: { required },
    buildingBlockId: { required },
    // roleIds: { required },
    createApplicationTables: { required },
    details: { required }
}));

const v$ = useVuelidate(rules, state);

// const {
//     data: roles,
//     isSuccess: isSuccessRoles,
//     isLoading: isLoadingRoles
// } = await useQuery({
//     queryKey: ["rolesList", { organizationId: user.value.user.organizationId }],
//     queryFn: () => manualGetRoles(),
//     enabled: isShow
// });

const {
    data: objects,
    isSuccess: isSuccessObjects,
    isLoading: isLoadingObjects
} = await useQuery({
    queryKey: ["objectsList", { organizationId: user.value.user.organizationId }],
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
    queryKey: ["blocksList", { blockId: valueObject }],
    queryFn: () => manualGetBlocks(valueObject.value),
    enabled: isEnabledBlocks
});

const valueBlock = computed(() => state.value.buildingBlockId);

const isEnabled  = computed(() => !!valueBlock.value.length);

const {
    data: floors,
    isSuccess: isSuccessFloors,
    isLoading: isLoadingFloors
} = await useQuery({
    queryKey: ["floorsList", { floorId: valueBlock }],
    queryFn: () => manualGetFloors(valueBlock.value),
    enabled: isEnabled 
});

const {
    data: costs,
    isSuccess: isSuccessCosts,
    isLoading: isLoadingCosts
} = await useQuery({
    queryKey: ["costsList", { organizationId: user.value.user.organizationId }],
    queryFn: () => manualGetCost(),
    enabled: isEnabled 
});

const {
    data: materials,
    isSuccess: isSuccessMaterials,
    isLoading: isLoadingMaterials
} = await useQuery({
    queryKey: ["materialsList", { organizationId: user.value.user.organizationId }],
    queryFn: () => manualConstructionMaterial(),
    enabled: isEnabled 
});

const inputs = ref([
    { 
        id: 1, 
        model: "deadline", 
        label: "dateAppLabel", 
        placeholder: "dateAppPlaceholder", 
        icon: "date",
        errorKey: "deadline",
        type: "date"
    }
]);

const selects = ref([
    { 
        id: 1, 
        model: "buildingObjectId", 
        label: "objectAppLabel", 
        placeholder: "objectAppPlaceholder",
        errorKey: "buildingObjectId",
        options: objects,
        success: isSuccessObjects,
        loading: isLoadingObjects
    },
    { 
        id: 2, 
        model: "buildingBlockId", 
        label: "blockAppLabel", 
        placeholder: "blockAppPlaceholder",
        errorKey: "buildingBlockId",
        options: blocks,
        success: isSuccessBlocks,
        loading: isLoadingBlocks
    },
    // { 
    //     id: 6, 
    //     model: "roleIds", 
    //     label: "appRoleLabel", 
    //     placeholder: "appRolePlaceholder", 
    //     errorKey: "roleIds", 
    //     options: roles, 
    //     success: isSuccessRoles,
    //     loading: isLoadingRoles,
    //     multiple: true
    // }
]);

const selectsInfo = ref([
    { 
        id: 1, 
        model: "floorId", 
        label: "floorsAppLabel", 
        placeholder: "floorsAppPlaceholder",
        options: floors,
        success: isSuccessFloors,
        loading: isLoadingFloors
    },
    { 
        id: 2, 
        model: "costId", 
        label: "costAppLabel", 
        placeholder: "costAppPlaceholder",
        options: costs,
        success: isSuccessCosts,
        loading: isLoadingCosts
    },
    { 
        id: 3, 
        model: "constructionMaterialId", 
        label: "materialsAppLabel", 
        placeholder: "materialsAppPlaceholder",
        options: materials,
        success: isSuccessMaterials,
        loading: isLoadingMaterials
    },
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
    });
}

const deleteHandler = (idx) => {
    state.value.createApplicationTables = state.value.createApplicationTables.filter((elem) => elem.delId !== idx);
}

const { mutate: createMutate } = useMutation({
    onMutate: (body) => {
        isSubmit.value = true;

        body.buildingObjectId = body.buildingObjectId[0];
        body.buildingBlockId = body.buildingBlockId[0];

        body.createApplicationTables = body.createApplicationTables.map((elem) => {
            const { delId, floorValue, costValue, constructionMaterialValue, ...rest } = elem;

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
    &__submit {
        margin-top: 30px;
    }
}
</style>
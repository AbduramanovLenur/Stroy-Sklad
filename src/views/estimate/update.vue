<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="addNewEstimateTitle" 
                :to="routes.ESTIMATE.path"
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
                    >
                        {{ $t(select.label) }}
                    </FormSelect>
                    <FormInput 
                        v-model="state.price"
                        :width="500" 
                        :placeholder="$t('estimatePricePlaceholder')"
                        name="money"
                        :error="v$?.price?.$error" 
                        :textError="v$?.price?.$errors[0]?.$message"
                        :isDisabled="true"
                    >
                        {{ $t("estimatePriceLabel") }}
                    </FormInput>
                    <FormSelect 
                        v-model.trim="state.stateId" 
                        :width="500" 
                        :options="states"
                        :error="v$?.stateId?.$error" 
                        placeholder="estimateStatePlaceholder"
                        :textError="v$?.stateId?.$errors[0]?.$message"
                        :success="isSuccessStates"
                        :loading="isLoadingStates"
                    >
                        {{ $t("estimateStateLabel") }}
                    </FormSelect>
                </div>
                <h3 class="manage__title" v-if="isSuccessBlocks && blocks?.length">
                    {{ $t("blockEstimateLabel") }}
                </h3>
                <ul class="manage__blocks" v-if="isSuccessBlocks && blocks?.length">
                    <li 
                        v-for="block in blocks" :key="block.id"
                        class="manage__block" 
                        @click="() => blockId = block.id"
                    >
                        <div :class="`manage__block-box ${blockId === block.id ? 'is-active' : ''}`">
                            {{ block.name }}
                        </div>
                    </li>
                </ul>
                <Spinner v-if="isLoadingBlocks" />
                <EstimateForm 
                    v-if="blockId && blocks?.length"
                    :selects="selectsInfo"
                    :blockId="blockId"
                    @onAddTable="addTableHandler"
                    @onChangeBlock="($event) => blockId = $event"
                />
                <span 
                    v-if="v$?.budgetTables?.$error" 
                    class="error"
                >
                    {{ v$?.budgetTables?.$errors[0]?.$message }}
                </span>
                <SubTable
                    v-if="blockId && blocks?.length"
                    :headers="headers"
                    :table="filteredSubtable"
                    @onActionDelete="deleteHandler"
                    :isShowDelete="true"
                />
                <FormTextarea 
                    v-if="blockId && blocks?.length"
                    v-for="input in textareas"
                    :key="input.id"
                    v-model.trim="state[input.model]"
                    :width="500" 
                    :placeholder="$t(input.placeholder)"
                    :error="v$?.[input.errorKey]?.$error" 
                    :textError="v$?.[input.errorKey]?.$errors[0]?.$message"
                >
                    {{ $t(input.label) }}
                </FormTextarea>
                <CustomButton v-if="blockId && blocks?.length" className="manage__submit">
                    {{ $t("formButton") }}
                </CustomButton>
            </form>
        </div>
    </section>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";
import { ref, watch, watchEffect, computed } from "vue";
import EstimateForm from "@/components/EstimateForm.vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/userStore";
import { useVuelidate } from "@vuelidate/core";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { required } from "@/utils/i18n-validators.js";
import { 
    useQueryClient, 
    useQuery,
    useMutation 
} from "@tanstack/vue-query";
import { getWithId, updateById } from "@/services/crud.services.js";
import { 
    manualConstructionMaterial, 
    manualGetFloors, 
    manualGetCost, 
    manualGetObjects, 
    manualGetBlocks,
    manualGetStates
} from "@/services/manual.services.js";
import { routes } from "@/utils/routes.js";
import { actionModules } from "@/utils/action-modules.js";
import { createIdMap } from "@/utils/secondary-functions.js";

const queryClient = useQueryClient();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const { t } = useI18n();

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShow = computed(() => !!user?.value.user?.modules?.includes(actionModules.ESTIMATE.CREATE));

const slugId = ref(route.params.id);

const headers = ref([
    { id: 1, label: "estimateBlock", width: 200 },
    { id: 2, label: "estimateFloor", width: 200 },
    { id: 3, label: "estimateMaterial", width: 260 },
    { id: 4, label: "estimateBudget", width: 200 },
    { id: 5, label: "estimateCost" }
]);

const state = ref({
    id: "",
    fullname: "",
    buildingObjectId: [],
    price: "",
    budgetTables: [],
    details: "",
    stateId: []
});

const isSubmit = ref(false);
const isFirstChange = ref(false);

const blockId = ref("");

const filteredSubtable = computed(() => state.value.budgetTables.filter((elem) => +elem.buildingBlockId === +blockId.value));

const rules = computed(() => ({
    id: { required },
    fullname: { required },
    buildingObjectId: { required },
    price: { required },
    budgetTables: { required },
    details: { required },
    stateId: { required }
}));

const v$ = useVuelidate(rules, state);

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
    if (!isFirstChange.value && !isSubmit.value) {
        state.value.budgetTables = [];
        blockId.value = "";
    }

    isFirstChange.value = false;
}, { immediate: true });

const {
    data: blocks,
    isSuccess: isSuccessBlocks,
    isLoading: isLoadingBlocks
} = await useQuery({
    queryKey: ["blocksList", { blockId: valueObject }],
    queryFn: () => manualGetBlocks(valueObject.value[0]),
    enabled: isEnabledBlocks
});

const valueBlock = computed(() => blockId.value);

const isEnabled  = computed(() => !!valueBlock.value);

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

const {
    data: states,
    isSuccess: isSuccessStates,
    isLoading: isLoadingStates
} = await useQuery({
    queryKey: ["states"],
    queryFn: () => manualGetStates(),
    enabled: isShow
});

const inputs = ref([
    { 
        id: 1, 
        model: "fullname", 
        label: "nameEstimateLabel", 
        placeholder: "nameEstimatePlaceholder", 
        icon: "input-company",
        errorKey: "fullname",
    }
]);

const selects = ref([
    { 
        id: 1, 
        model: "buildingObjectId", 
        label: "objectEstimateLabel", 
        placeholder: "objectEstimatePlaceholder",
        errorKey: "buildingObjectId",
        options: objects,
        success: isSuccessObjects,
        loading: isLoadingObjects
    }
]);

const selectsInfo = ref([
    { 
        id: 1, 
        model: "floorId", 
        label: "floorsEstimateLabel", 
        placeholder: "floorsEstimatePlaceholder", 
        options: floors,
        success: isSuccessFloors,
        loading: isLoadingFloors
    },
    { 
        id: 2, 
        model: "costId", 
        label: "costEstimateLabel", 
        placeholder: "costEstimatePlaceholder",
        options: costs,
        success: isSuccessCosts,
        loading: isLoadingCosts
    },
    { 
        id: 3, 
        model: "constructionMaterailIds", 
        label: "materialsEstimateLabel", 
        placeholder: "materialsEstimatePlaceholder",
        options: materials,
        success: isSuccessMaterials,
        loading: isLoadingMaterials,
        multiple: true
    }
])

const textareas = ref([
    { 
        id: 1, 
        model: "details", 
        label: "estimateCommentLabel", 
        placeholder: "estimateCommentPlaceholder",
        errorKey: "details"
    }
]);

const blockMap = computed(() => createIdMap(blocks.value || []));
const floorMap = computed(() => createIdMap(floors.value || []));
const costMap = computed(() => createIdMap(costs.value || []));
const materialMap = computed(() => createIdMap(materials.value || []));

const getBlockIdValue = (elem) => blockMap.value[elem.buildingBlockId]?.name;
const getFloorIdValue = (elem) => floorMap.value[elem.floorId]?.name;
const getCostIdValue = (elem) => costMap.value[elem.costId]?.name;
const getConstructionMaterialIdsValue = (elem) => {
    return elem.constructionMaterailIds?.map((item, index) => ({
        id: index + 1,
        name: materialMap.value[item]?.name || 'Unknown Material'
    }));
}

const isNotAllEmptyData = computed(() => state.value.budgetTables.length && Object.keys(blockMap.value).length && Object.keys(floorMap.value).length && Object.keys(costMap.value).length && Object.keys(materialMap.value).length);

const addTableHandler = (object) => {
    if (!!isNotAllEmptyData) {
        state.value.budgetTables.push({
            ...object, 
            delId: uuidv4(),
            blockValue: getBlockIdValue(object),
            floorValue: getFloorIdValue(object),
            costValue: getCostIdValue(object),
            constructionMaterialIdsValue: getConstructionMaterialIdsValue(object)
        });

        state.value.price = +state.value.price + +object.price;
        return;
    }

    toast.error(t("estimateEmptyData"));
}

const isInitialRender = ref(true);

watch(isNotAllEmptyData, (newValue) => {
    if (!!newValue && isInitialRender.value) {
        state.value.budgetTables = state.value.budgetTables.map((elem) => {
            const object = {
                ...elem,
                delId: uuidv4(),
                blockValue: getBlockIdValue(elem),
                floorValue: getFloorIdValue(elem),
                costValue: getCostIdValue(elem),
                constructionMaterialIdsValue: getConstructionMaterialIdsValue(elem)
            }

            return object;
        });

        isInitialRender.value = false;
    }
}, { immediate: true });

const deleteHandler = (idx) => {
    state.value.budgetTables = state.value.budgetTables.filter((elem) => elem.delId !== idx);
}

const { isError } = await useQuery({
    queryKey: ["budgetsById", slugId],
    queryFn: () => getWithId("budget", slugId.value),
    select: (data) => {
        state.value.id = data.id;
        state.value.fullname = data.fullname;
        state.value.buildingObjectId = [data.buildingObjectId];
        state.value.price = data.price; 
        state.value.budgetTables = [...data.budgetTables];
        state.value.details = data.details;
        state.value.stateId = [data.stateId];

        isFirstChange.value = true;
    },
    enabled: isShow
});

watch(isError, (value) => {
    if (value) {
        router.push(routes.HOME.path);
    }
});


const { mutate: updateMutate } = useMutation({
    onMutate: (body) => {
        isSubmit.value = true;

        body.budgetTables = body.budgetTables.map((elem) => {
            let object = { ...elem };

            delete object.delId;
            delete object.blockValue;
            delete object.floorValue;
            delete object.costValue;
            delete object.constructionMaterialIdsValue;

            return object;
        });

        body.buildingObjectId = body.buildingObjectId[0];
        body.stateId = body.stateId[0];
    },
    mutationFn: (body) => updateById("budget", body),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["budgets"] });
        queryClient.invalidateQueries({ queryKey: ["budgetsById", slugId] });
        
        router.push(routes.ESTIMATE.path);
    }
});

const submitHandler = () => {
    v$.value.$validate();

    if (v$.value.$errors.length) {
        return;
    }

    updateMutate(state.value);
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
    &__title {
        font-size: 20px;
        margin-bottom: 10px;
    }
    &__blocks {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    &__block {
        max-width: 150px;
        width: 100%;
        &-box {
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 20px;
            padding: 10px;
            background-color: var(--black);
            color: var(--white);
            border-radius: 10px;
            cursor: pointer;
            &.is-active {
                background-color: var(--red);
            }
        }
    }
    &__submit {
        margin-top: 30px;
    }
}
</style>
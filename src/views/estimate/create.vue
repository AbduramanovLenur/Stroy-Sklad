<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="addNewEstimateTitle" 
                :to="routes.ESTIMATE.path"
            />
            <form class="manage__form" @submit.prevent="submitHandler">
                <div class="manage__overlay">
                    <template v-for="field in fields" :key="field.id">
                        <FormInput 
                            v-if="!field?.select"
                            v-model="state[field.model]"
                            :width="500" 
                            :placeholder="$t(field.placeholder)"
                            :name="field.icon"
                            :error="v$?.[field.errorKey]?.$error" 
                            :textError="v$?.[field.errorKey]?.$errors[0]?.$message"
                            :isDisabled="field?.isDisabled"
                        >
                            {{ $t(field.label) }}
                        </FormInput>
                        <FormSelect 
                            v-if="field?.select"
                            v-model.trim="state[field.model]" 
                            :width="500" 
                            :options="field.options"
                            :error="v$?.[field?.errorKey]?.$error" 
                            :placeholder="field?.placeholder"
                            :textError="v$?.[field?.errorKey]?.$errors[0]?.$message"
                            :success="field.success"
                            :loading="field.loading"
                        >
                            {{ $t(field.label) }}
                        </FormSelect>
                    </template>
                </div>
                <h3 
                    v-if="isSuccessBlocks && blocks?.length"
                    class="manage__title"
                >
                    {{ $t("blockEstimateLabel") }}
                </h3>
                <ul 
                    v-if="isSuccessBlocks && blocks?.length"
                    class="manage__blocks"
                >
                    <li 
                        v-for="block in blocks" 
                        :key="block.id"
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
                    v-if="blockId"
                    :subFields="subFields"
                    :blockId="blockId"
                    @onAddTable="addTableHandler"
                    @onChangeBlock="($event) => blockId = $event"
                />
                <span 
                    v-if="v$?.tables?.$error" 
                    class="error"
                >
                    {{ v$?.tables?.$errors[0]?.$message }}
                </span>
                <SubTable
                    v-if="blockId"
                    :headers="headers"
                    :table="filteredSubtable"
                    @onActionDelete="deleteHandler"
                    :isShowDelete="true"
                />
                <FormTextarea 
                    v-if="blockId"
                    v-model.trim="state.details"
                    :width="500" 
                    :placeholder="$t('estimateCommentPlaceholder')"
                    :error="v$?.details?.$error" 
                    :textError="v$?.details?.$errors[0]?.$message"
                >
                    {{ $t("estimateCommentLabel") }}
                </FormTextarea>
                <CustomButton 
                    v-if="blockId" 
                    className="manage__submit"
                    :disabled="status === 'pending'"
                >
                    {{ $t("formButton") }}
                </CustomButton>
            </form>
        </div>
    </section>
</template>

<script setup>
import EstimateForm from "@/components/EstimateForm.vue"
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

const isShow = computed(() => !!user?.value.user?.modules?.includes(actionModules.ESTIMATE.CREATE));

const headers = ref([
    { id: 1, label: "estimateBlock", width: 15 },
    { id: 2, label: "estimateFloor", width: 20 },
    { id: 3, label: "estimateMaterial", width: 25 },
    { id: 4, label: "estimateBudget", width: 20 },
    { id: 5, label: "estimateCost", width: 20 }
]);

const state = ref({
    fullname: "",
    buildingObjectId: [],
    price: "",
    tables: [],
    details: ""
});

const isSubmit = ref(false);

const blockId = ref("");

const filteredSubtable = computed(() => state.value.tables.filter((elem) => +elem.buildingBlockId === +blockId.value));

const rules = computed(() => ({
    fullname: { required },
    buildingObjectId: { required },
    price: { required },
    tables: { required },
    details: { required },
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

const valueObject = computed(() => state.value.buildingObjectId[0]);

const isEnabledBlocks = computed(() => !!valueObject.value);

watch(valueObject, () => {
    if (!isSubmit.value) {
        state.value.tables = [];
        blockId.value = "";
    }
}, { immediate: true });

const {
    data: blocks,
    isSuccess: isSuccessBlocks,
    isLoading: isLoadingBlocks
} = await useQuery({
    queryKey: ["blocksList", { 
        objectId: valueObject, 
        organizationId: user.value.user.organizationId, 
        name: user.value.user.fullName 
    }],
    queryFn: () => manualGetBlocks(valueObject.value),
    enabled: isEnabledBlocks
});

const valueBlock = computed(() => blockId.value);

const isEnabledFloors  = computed(() => !!valueBlock.value);

const {
    data: floors,
    isSuccess: isSuccessFloors,
    isLoading: isLoadingFloors
} = await useQuery({
    queryKey: ["floorsList", { 
        blockId: valueBlock, 
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
        model: "fullname", 
        label: "nameEstimateLabel", 
        placeholder: "nameEstimatePlaceholder", 
        icon: "input-company",
        errorKey: "fullname",
    },
    { 
        id: 2, 
        model: "buildingObjectId", 
        label: "objectEstimateLabel", 
        placeholder: "objectEstimatePlaceholder",
        errorKey: "buildingObjectId",
        options: objects,
        success: isSuccessObjects,
        loading: isLoadingObjects,
        select: true
    },
    { 
        id: 3, 
        model: "price", 
        label: "estimatePriceLabel", 
        placeholder: "estimatePricePlaceholder", 
        icon: "money",
        errorKey: "price",
        isDisabled: true
    },
]);

const subFields = ref([
    { 
        id: 1, 
        model: "floorId", 
        label: "floorsEstimateLabel", 
        placeholder: "floorsEstimatePlaceholder", 
        options: floors,
        success: isSuccessFloors,
        loading: isLoadingFloors,
        select: true
    },
    { 
        id: 2, 
        model: "costId", 
        label: "costEstimateLabel", 
        placeholder: "costEstimatePlaceholder",
        options: costs,
        success: isSuccessCosts,
        loading: isLoadingCosts,
        select: true
    },
    { 
        id: 3, 
        model: "constructionMaterailIds", 
        label: "materialsEstimateLabel", 
        placeholder: "materialsEstimatePlaceholder",
        options: materials,
        success: isSuccessMaterials,
        loading: isLoadingMaterials,
        multiple: true,
        select: true
    },
    { 
        id: 4, 
        model: "price", 
        label: "priceEstimateLabel", 
        placeholder: "priceEstimatePlaceholder", 
        icon: "money"
    },
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

const addTableHandler = (object) => {
    state.value.tables.push({ 
        ...object, 
        delId: uuidv4(),
        blockValue: getBlockIdValue(object),
        floorValue: getFloorIdValue(object),
        costValue: getCostIdValue(object),
        constructionMaterialIdsValue: getConstructionMaterialIdsValue(object)
    });
    
    state.value.price = +state.value.price + object.price;
}

const deleteHandler = (idx) => {
    state.value.tables = state.value.tables.filter((elem) => {
        const isEqual = elem.delId !== idx;

        if (!isEqual) state.value.price -= elem.price;

        return isEqual;
    });
}

const { mutate: createMutate, status } = useMutation({
    onMutate: (body) => {
        isSubmit.value = true;

        body.tables = body.tables.map((elem) => {
            const { 
                delId, 
                blockValue, 
                floorValue, 
                costValue, 
                constructionMaterialIdsValue, 
                ...rest 
            } = elem;

            return rest;
        });

        body.buildingObjectId = body.buildingObjectId[0];
    },
    mutationFn: (body) => create("budget", body),
    onSuccess: (response) => {
        if (!response?.success) return;

        state.value = clearState(state.value);

        queryClient.invalidateQueries({ queryKey: ["budgets"] });
        
        router.push(routes.ESTIMATE.path);

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
    &__title {
        font-size: 20px;
        margin-bottom: 10px;
    }
    &__blocks {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
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
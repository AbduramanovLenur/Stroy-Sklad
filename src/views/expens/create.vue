<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="addNewExpensesTitle" 
                :to="routes.EXPENS.path"
            />
            <div class="manage__stock-warehouse">
                <div class="manage__stock-label">
                    {{ 
                        filteredMaterial?.[0]?.count ? 
                        $t('expenseStockMaterial') : 
                        $t('expenseSampleMaterial') 
                    }}
                </div>
                <div v-if="filteredMaterial?.[0]?.count" class="manage__stock-value">
                    {{ filteredMaterial?.[0]?.count }} {{ filteredMaterial?.[0]?.quantityType }}
                </div>
            </div>
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
                        >
                            {{ $t(field.label) }}
                        </FormSelect>
                    </template>
                </div>
                <CustomButton 
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
import { create, getWithId } from "@/services/crud.services.js"
import { useUserStore } from "@/store/userStore"
import { actionModules } from "@/utils/action-modules.js"
import { required } from "@/utils/i18n-validators.js"
import { routes } from "@/utils/routes.js"
import { clearState } from "@/utils/secondary-functions.js"
import { 
    manualGetWarehouse, 
    manualGetObjects, 
    manualGetBlocks,
    manualGetFloors, 
    manualGetCost
} from "@/services/manual.services.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query"
import { useVuelidate } from "@vuelidate/core"
import { storeToRefs } from "pinia"
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

const isShow = computed(() => !!user?.value.user?.modules?.includes(actionModules.EXPENS.CREATE));

const isSubmit = ref(false);

const state = ref({
    constructionMaterialId: [],
    count: "",
    buildingObjectId: [],
    buildingBlockId: [],
    floorId: [],
    costId: []
});

const rules = computed(() => ({
    constructionMaterialId: { required },
    count: { required },
    buildingObjectId: { required },
    buildingBlockId: { required },
    floorId: { required },
    costId: { required }
}));

const v$ = useVuelidate(rules, state);

const {
    data: materials,
    isSuccess: isSuccessMaterials,
    isLoading: isLoadingMaterials
} = await useQuery({
    queryKey: ["warehouseList", { 
        organizationId: user.value.user.organizationId, 
        name: user.value.user.fullName 
    }],
    queryFn: () => manualGetWarehouse(),
    enabled: isShow
});

const filteredMaterial = computed(() => materials.value?.filter((elem) => elem.id === state.value.constructionMaterialId?.[0]));

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

const valueBlock = computed(() => state.value.buildingBlockId[0]);

const isEnabledFloors  = computed(() => !!valueBlock.value);

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

const fields = ref([
    { 
        id: 1, 
        model: "constructionMaterialId", 
        label: "expenseMaterialLabel", 
        placeholder: "expenseMaterialPlaceholder",
        errorKey: "constructionMaterialId",
        options: materials,
        success: isSuccessMaterials,
        loading: isLoadingMaterials,
        select: true
    },
    { 
        id: 2, 
        model: "count", 
        label: "expenseCountLabel", 
        placeholder: "expenseCountPlaceholder", 
        icon: "list",
        errorKey: "count",
        type: "number"
    },
    { 
        id: 3, 
        model: "buildingObjectId", 
        label: "expenseObjectLabel", 
        placeholder: "expenseObjectPlaceholder",
        errorKey: "buildingObjectId",
        options: objects,
        success: isSuccessObjects,
        loading: isLoadingObjects,
        select: true
    },
    { 
        id: 4, 
        model: "buildingBlockId", 
        label: "expenseBlockLabel", 
        placeholder: "expenseBlockPlaceholder",
        errorKey: "buildingBlockId",
        options: blocks,
        success: isSuccessBlocks,
        loading: isLoadingBlocks,
        select: true
    },
    { 
        id: 5, 
        model: "floorId", 
        label: "expenseFloorLabel", 
        placeholder: "expenseFloorPlaceholder",
        errorKey: "floorId",
        options: floors,
        success: isSuccessFloors,
        loading: isLoadingFloors,
        select: true
    },
    { 
        id: 6, 
        model: "costId", 
        label: "expenseCostLabel", 
        placeholder: "expenseCostPlaceholder",
        errorKey: "costId",
        options: costs,
        success: isSuccessCosts,
        loading: isLoadingCosts,
        select: true
    }
]);

const { mutate: createMutate, status } = useMutation({
    onMutate: (body) => {
        body.constructionMaterialId = body.constructionMaterialId[0];
        body.buildingObjectId = body.buildingObjectId[0];
        body.buildingBlockId = body.buildingBlockId[0];
        body.floorId = body.floorId[0];
        body.costId = body.costId[0];
    },
    mutationFn: (body) => create("expense", body),
    onSuccess: (response) => {
        if (!response?.success) return;
        
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        queryClient.invalidateQueries({ queryKey: ["warehouse"] });
        queryClient.invalidateQueries({ queryKey: ["warehouseById", filteredMaterial.value?.[0]?.warehouseId.toString()] });
        queryClient.invalidateQueries({ queryKey: ["warehouseList"] });
        queryClient.invalidateQueries({ queryKey: ["reports", "expense"] });

        state.value = clearState(state.value);

        router.push(routes.EXPENS.path);

        setTimeout(() => toast.success(t("createToast")), 150);
    }
});

const submitHandler = () => {

    const isNegativeValue = (filteredMaterial.value?.[0]?.count - state.value.count) < 0;

    if (isNegativeValue) {
        toast.error(t("negativeMeaningToast"));
        return;
    }

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
    &__stock {
        &-warehouse {
            font-size: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            height: 30px;
            margin-top: 20px;
            @media (max-width: 768px) {
                font-size: 16px;
            }
        }
    }
}
</style>
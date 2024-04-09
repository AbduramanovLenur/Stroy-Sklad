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
                    {{ filteredMaterial?.[0]?.count }}
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
            </form>
        </div>
    </section>
</template>

<script setup>
import { getWithId } from "@/services/crud.services.js"
import { useUserStore } from "@/store/userStore"
import { actionModules } from "@/utils/action-modules.js"
import { routes } from "@/utils/routes.js"
import {
    manualGetWarehouse,
    manualGetBlocks,
    manualGetCost,
    manualGetFloors,
    manualGetObjects
} from "@/services/manual.services.js"
import { useQuery } from "@tanstack/vue-query"
import { storeToRefs } from "pinia"
import { computed, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

const router = useRouter();
const route = useRoute();

const slugId = ref(route.params.id);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShow = computed(() => !!user?.value.user?.modules?.includes(actionModules.EXPENS.CREATE));  

const state = ref({
    constructionMaterialId: [],
    count: "",
    buildingObjectId: [],
    buildingBlockId: [],
    floorId: [],
    costId: []
});

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
        type: "number"
    },
    { 
        id: 3, 
        model: "buildingObjectId", 
        label: "expenseObjectLabel", 
        placeholder: "expenseObjectPlaceholder",
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
        options: costs,
        success: isSuccessCosts,
        loading: isLoadingCosts,
        select: true
    }
]);

const { isError: isErrorExpens } = await useQuery({
    queryKey: ["expensById", slugId, user.value.user.fullName],
    queryFn: () => getWithId("expense", slugId.value),
    select: (data) => {
        state.value.constructionMaterialId = [data.constructionMaterialId];
        state.value.count = data.count;
        state.value.buildingObjectId = [data.buildingObjectId];
        state.value.buildingBlockId = [data.buildingBlockId];
        state.value.floorId = [data.floorId];
        state.value.costId = [data.costId];
    },
    enabled: isShow
});

watch(isErrorExpens, (value) => {
    if (value) {
        router.push(routes.EXPENS.path);
    }
});
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
            margin-top: 10px;
        }
    }
}
</style>
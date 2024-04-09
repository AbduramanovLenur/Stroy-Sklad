<template>
    <section class="reports" v-if="isShow">
        <div class="reports__inner">
            <div class="reports__head">
                <div class="reports__wrapper shadowed">
                    <Title>
                        {{ $t('reportsTitle') }}
                    </Title>
                    <div class="reports__tabs">
                        <div 
                            v-for="tab in tabs" 
                            :key="tab.id" 
                            :class="`reports__tab ${flag === tab.query ? 'is-active' : ''}`"
                            @click="() => flag = tab.query"
                        >
                            {{ $t(tab.label) }}
                        </div>
                    </div>
                    <button 
                        v-if="user?.user?.modules?.includes(actionModules.REPORTS.DOWNLOAD)"
                        class="reports__download hovered" 
                        type="button" 
                        @click="() => mutate(queries)"
                    >
                        <span class="reports__download-icon">
                            <Icon name="download" />
                        </span>
                        <span class="reports__download-value">
                            {{ $t("downloadLink") }}
                        </span>
                    </button>
                </div>
                <div class="reports__filter shadowed" @click="() => isOpenFilter = !isOpenFilter">
                    <div class="reports__filter-icon">
                        <Icon name="filter" />
                    </div>
                    <div class="reports__filter-value">
                        {{ $t('filtLabel') }}
                    </div>
                </div>
            </div>
            <div v-if="isOpenFilter" class="reports__filter-fields shadowed">
                <div v-if="flag === 'expense'" class="reports__filter-expense filter-fields">
                    <template v-for="field in expenseFields" :key="field.id">
                        <FormInput 
                            v-if="!field?.select"
                            v-model="filterState[field.model]"
                            :placeholder="$t(field.placeholder)"
                            :name="field.icon"
                            :type="field?.type"
                        >
                            {{ $t(field.label) }}
                        </FormInput>
                        <FormSelect 
                            v-if="field?.select"
                            v-model.trim="filterState[field.model]" 
                            :options="field.options"
                            :placeholder="field?.placeholder"
                            :success="field.success"
                            :loading="field.loading"
                        >
                            {{ $t(field.label) }}
                        </FormSelect>
                    </template>
                </div>
                <div v-if="flag === 'warehouse'" class="reports__filter-expense filter-fields">
                    <template v-for="field in warehouseFields" :key="field.id">
                        <FormInput 
                            v-if="!field?.select"
                            v-model="filterState[field.model]"
                            :placeholder="$t(field.placeholder)"
                            :name="field.icon"
                            :type="field?.type"
                        >
                            {{ $t(field.label) }}
                        </FormInput>
                        <FormSelect 
                            v-if="field?.select"
                            v-model.trim="filterState[field.model]" 
                            :options="field.options"
                            :placeholder="field?.placeholder"
                            :success="field.success"
                            :loading="field.loading"
                        >
                            {{ $t(field.label) }}
                        </FormSelect>
                    </template>
                </div>
            </div>
            <Table 
                v-if="isSuccessReports && reports?.length"
                :headers="flag === 'expense' ? headersExpens : headersWarehouse" 
                :table="reports"
                :isShowUpdate="false"
                :isShowDelete="false"
                :isShowState="false"
            />
            <div v-if="flag === 'expense' && reports?.length" class="reports__general shadowed">
                <div class="reports__general-label">
                    {{ $t('totalAmount') }}
                </div>
                <div class="reports__general-value">
                    {{ priceSeperator(reports.reduce((accumulator, current) => accumulator + current.summa, 0)) }} UZS
                </div>
            </div>
            <Spinner v-if="isLoadingReports" />
            <div 
                v-if="(isSuccessReports && !reports?.length) || isError" 
                class="empty-table shadowed"
            >
                {{ $t("emptyTableTitle") }}
            </div>
        </div>
    </section>
</template>

<script setup>
import { priceSeperator } from "@/utils/secondary-functions.js";
import { exportWithExcel, getReports } from "@/services/crud.services.js"
import {
    manualConstructionMaterial,
    manualGetBlocks,
    manualGetFloors,
    manualGetObjects,
    manualQuantityTypes
} from "@/services/manual.services.js"
import { useUserStore } from "@/store/userStore"
import { actionModules } from "@/utils/action-modules.js"
import { useMutation, useQuery } from "@tanstack/vue-query"
import { storeToRefs } from "pinia"
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useToast } from "vue-toastification"

const toast = useToast();
const { t } = useI18n();

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShow = computed(() => !!user?.value.user?.modules?.includes(actionModules.REPORTS.READ));

const flag = ref("expense");

const isOpenFilter = ref(false);

const tabs = ref([
    { id: 1, label: "reportsExpens", query: "expense" },
    { id: 2, label: "reportsWarehouse", query: "warehouse" }
]);

const headersExpens = ref([
    { id: 1, label: "reportsMaterial", width: 20 },
    { id: 2, label: "reportsQuantity", width: 10 },
    { id: 3, label: "reportsObyekt", width: 20 },
    { id: 4, label: "reportsBlock", width: 20 },
    { id: 5, label: "reportsFloor", width: 10 },
    { id: 6, label: "reportsBudget", width: 20 }
]);

const headersWarehouse = ref([
    { id: 1, label: "reportsMaterial", width: 70 },
    { id: 2, label: "reportsQuantity", width: 30 },
]);

const filterState = ref({
    MaterialId: [],
    ObjectId: [],
    BlockId: [],
    FloorId: [],
    QuantityTypeId: []
});

const queries = computed(() => {
    const keys = Object.keys(filterState.value);
    let query = `?tableName=${flag.value}&`;

    keys.forEach((key) => {
        if (filterState.value[key]?.length) {
            query += `${key}=${filterState.value[key]}&`
        }
    });

    return query.slice(0, -1);
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

const {
    data: objectsList,
    isSuccess: isSuccessObjectsList,
    isLoading: isLoadingObjectsList
} = await useQuery({
    queryKey: ["objectsList", { 
        organizationId: user.value.user.organizationId, 
        name: user.value.user.fullName 
    }],
    queryFn: () => manualGetObjects(),
    enabled: isShow
});

const valueObject = computed(() => filterState.value.ObjectId?.[0]);

const isEnabledBlocks = computed(() => !!valueObject.value);

watch(valueObject, () => {
    filterState.value.BlockId = [];
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

const valueBlock = computed(() => filterState.value.BlockId?.[0]);

const isEnabledFloors  = computed(() => !!valueBlock.value);

watch(valueBlock, () => {
    filterState.value.FloorId = [];
}, { immediate: true });

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

const isEnabledTypes = computed(() => isShow && flag.value === 'warehouse');

const {
    data: quantityTypes,
    isSuccess: isSuccessQunatityTypes,
    isLoading: isLoadingQunatityTypes
} = await useQuery({
    queryKey: ["types"],
    queryFn: () => manualQuantityTypes(),
    enabled: isEnabledTypes
});

const expenseFields = ref([
    { 
        id: 1, 
        model: "MaterialId", 
        label: "materialLabel", 
        placeholder: "materialPlacehoder",
        options: materials,
        success: isSuccessMaterials,
        loading: isLoadingMaterials,
        select: true
    },
    { 
        id: 2, 
        model: "ObjectId", 
        label: "objectLabel", 
        placeholder: "objectPlacehoder",
        options: objectsList, 
        success: isSuccessObjectsList,
        loading: isLoadingObjectsList,
        select: true
    },
    { 
        id: 3, 
        model: "BlockId", 
        label: "blockLabel", 
        placeholder: "blockPlacehoder",
        options: blocks,
        success: isSuccessBlocks,
        loading: isLoadingBlocks,
        select: true
    },
    { 
        id: 4, 
        model: "FloorId", 
        label: "floorsAppLabel", 
        placeholder: "floorsAppPlaceholder",
        options: floors,
        success: isSuccessFloors,
        loading: isLoadingFloors,
        select: true
    },
]);

const warehouseFields = ref([
    { 
        id: 1, 
        model: "MaterialId", 
        label: "materialLabel", 
        placeholder: "materialPlacehoder",
        options: materials,
        success: isSuccessMaterials,
        loading: isLoadingMaterials,
        select: true
    },
    { 
        id: 2, 
        model: "QuantityTypeId", 
        label: "quantityTypeLabel", 
        placeholder: "quantityTypePlaceholder",
        options: quantityTypes,
        success: isSuccessQunatityTypes,
        loading: isLoadingQunatityTypes,
        select: true
    }
]);

const {
    data: reports,
    isLoading: isLoadingReports,
    isSuccess: isSuccessReports,
    isError
} = await useQuery({
    queryKey: ["reports", queries, {
        organizationId: user.value.user.organizationId, 
        name: user.value.user.fullName 
    }],
    queryFn: () => getReports(queries.value),
    select: (data) => {
        return data.map((elem) => {
            const object = { ...elem, quantityTypeValue: elem.quantityType };

            delete object.quantityType;

            return object;
        })
    },
    enabled: isShow
});

const { mutate } = useMutation({
    mutationFn: (query) => exportWithExcel(query),
    onSuccess: (response) => {
        if (!response?.success) return;

        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'filename.xlsx');
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);

        setTimeout(() => toast.success(t("downloadToast")), 150);
    }
});
</script>

<style lang="scss" scoped>
.filter-fields {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    width: 100%;
    @media (max-width: 1350px) {
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
    }
    @media (max-width: 1152px) {
        grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: 864px) {
        grid-template-columns: repeat(1, 1fr);
    }
}
.reports {
    &__head {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 20px;
        @media (max-width: 640px) {
            flex-direction: column;
            align-items: flex-start;
        }
    }
    &__wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        width: 100%;
        @media (max-width: 1024px) {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
        }
        @media (max-width: 480px) {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }
    }
    &__filter {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        width: 95px;
        height: 95px;
        &-value {
            font-weight: 600;
        }
        &-fields {
            margin-bottom: 20px;
        }
    }
    &__download {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background-color: var(--black);
        border-radius: 5px;
        height: 40px;
        padding: 5px 10px;
        max-width: 170px;
        width: 100%;
        &-icon {
            display: flex;
            align-items: center;
        }
        &-value {
            font-weight: 500;
            color: var(--white);
            text-transform: uppercase;
            @media (max-width: 480px) {
                font-size: 14px;
            }
        }
    }
    &__tabs {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        @media (max-width: 1024px) {
            justify-content: flex-end;
        }
        @media (max-width: 480px) {
            justify-content: flex-start;
        }
    }
    &__tab {
        font-size: 18px;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: center;
        max-width: 100px;
        width: 100%;
        padding: 10px;
        cursor: pointer;
        border: 1px solid var(--black);
        border-radius: 10px;
        &.is-active {
            background-color: var(--black);
            color: var(--white);
        }
    }
    &__general {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        margin-top: 20px;
        &-label,
        &-value {
            font-size: 18px;
        }
        &-label {
            font-weight: 500;
        }
        &-value {
            font-weight: 600;
        }
    }
}
</style>
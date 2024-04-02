<template>
    <section class="reports" v-if="isShow">
        <div class="reports__inner">
            <div class="reports__head shadowed">
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
                    @click="() => mutate(flag)"
                >
                    <span class="reports__download-icon">
                        <Icon name="download" />
                    </span>
                    <span class="reports__download-value">
                        {{ $t("downloadLink") }}
                    </span>
                </button>
            </div>
            <Table 
                v-if="isSuccessReports && reports?.length"
                :headers="flag === 'expense' ? headersExpens : headersWarehouse" 
                :table="reports"
                :isShowUpdate="false"
                :isShowDelete="false"
                :isShowState="false"
            />
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
import { ref } from "vue";
import { exportWithExcel, getReports } from "@/services/crud.services.js"
import { useUserStore } from "@/store/userStore"
import { actionModules } from "@/utils/action-modules.js"
import { useMutation, useQuery } from "@tanstack/vue-query"
import { storeToRefs } from "pinia"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { useToast } from "vue-toastification"

const toast = useToast();
const { t } = useI18n();

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShow = computed(() => !!user?.value.user?.modules?.includes(actionModules.REPORTS.READ));

const flag = ref("expense");

const tabs = ref([
    { id: 1, label: "reportsExpens", query: "expense" },
    { id: 2, label: "reportsWarehouse", query: "warehouse" }
]);

const headersExpens = [
    { id: 1, label: "reportsMaterial", width: 20 },
    { id: 2, label: "reportsQuantity", width: 10 },
    { id: 3, label: "reportsObyekt", width: 20 },
    { id: 4, label: "reportsBlock", width: 20 },
    { id: 5, label: "reportsFloor", width: 10 },
    { id: 6, label: "reportsBudget", width: 20 }
];

const headersWarehouse = [
    { id: 1, label: "reportsMaterial", width: 70 },
    { id: 2, label: "reportsQuantity", width: 30 },
];

const {
    data: reports,
    isLoading: isLoadingReports,
    isSuccess: isSuccessReports,
    isError
} = await useQuery({
    queryKey: ["reports", flag, {
        organizationId: user.value.user.organizationId, 
        name: user.value.user.fullName 
    }],
    queryFn: () => getReports(flag.value),
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
.reports {
    &__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 20px;
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
}
</style>
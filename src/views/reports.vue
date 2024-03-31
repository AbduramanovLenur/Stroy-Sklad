<template>
    <section class="reports" v-if="isShow">
        <div class="reports__inner">
            <div class="reports__head shadowed">
                <Title>
                    {{ $t('reportsTitle') }}
                </Title>
                <button class="reports__download hovered" type="button" @click="mutate">
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
                :headers="headers" 
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

const headers = [
    { id: 1, label: "reportsMaterial", width: 30 },
    { id: 2, label: "reportsQuantity", width: 10 },
    { id: 3, label: "reportsObyekt", width: 20 },
    { id: 4, label: "reportsBlock", width: 20 },
    { id: 5, label: "reportsFloor", width: 10 },
    { id: 6, label: "reportsBudget", width: 10 }
];

const {
    data: reports,
    isLoading: isLoadingReports,
    isSuccess: isSuccessReports,
    isError
} = await useQuery({
    queryKey: ["reports", {
        organizationId: user.value.user.organizationId, 
        name: user.value.user.fullName 
    }],
    queryFn: () => getReports(),
    enabled: isShow
});

const { mutate } = useMutation({
    mutationFn: () => exportWithExcel(),
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
        @media (max-width: 640px) {
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
}
</style>
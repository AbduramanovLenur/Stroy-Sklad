<template>
    <section class="reports" v-if="isShow">
        <div class="reports__inner">
            <div class="reports__head shadowed">
                <Title>
                    {{ $t('reportsTitle') }}
                </Title>
                <a class="reports__download" href="#">
                    <span class="reports__download-icon">
                        <Icon name="download" />
                    </span>
                    <span class="reports__download-value">
                        {{ $t("downloadLink") }}
                    </span>
                </a>
            </div>
            <Table 
                v-if="isSuccessReports && reports?.length"
                :headers="headers" 
                :table="reports"
                :options="{ page: 1, limit: 10 }"
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
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/userStore";
import { getReports } from "@/services/crud.services.js";
import { actionModules } from "@/utils/action-modules.js";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { useQuery } from "@tanstack/vue-query";

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
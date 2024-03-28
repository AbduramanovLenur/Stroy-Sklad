<template>
    <section class="estimate" v-if="isShowList">
        <div class="estimate__inner">
            <HeadPage 
                title="estimateTitle" 
                :to="routes.CREATE_ESTIMATE.path"
                :isShowCreate="user?.user?.modules?.includes(actionModules.ESTIMATE.CREATE)"
            />
            <Table 
                v-if="isSuccessBudgets && budgets?.count"
                :headers="headers" 
                :table="budgets?.budgets"
                :to="routes.UPDATE_ESTIMATE.name"
                :options="{ page, limit }"
                :isShowUpdate="user?.user?.modules?.includes(actionModules.ESTIMATE.UPDATE)"
                :isShowDelete="user?.user?.modules?.includes(actionModules.ESTIMATE.DELETE)"
                @onActionDelete="deleteHandler"
            />
            <Pagination
                :count="budgets?.count"
                :isSucces="isSuccessBudgets"
            />
            <Spinner v-if="isLoadingBudgets" />
            <div 
                v-if="(isSuccessBudgets && !budgets.count) || isError"
                class="empty-table shadowed"
            >
                {{ $t("emptyTableTitle") }}
            </div>
        </div>
    </section>
</template>

<script setup>
import { deleteWithId, getList } from "@/services/crud.services.js"
import { useTableStore } from "@/store/tableStore"
import { useUserStore } from "@/store/userStore"
import { actionModules } from "@/utils/action-modules.js"
import { routes } from "@/utils/routes.js"
import {
useMutation,
useQuery,
useQueryClient
} from "@tanstack/vue-query"
import { refDebounced } from "@vueuse/core"
import { storeToRefs } from "pinia"
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useToast } from "vue-toastification"

const queryClient = useQueryClient();

const toast = useToast();
const { t } = useI18n();

const tableStore = useTableStore();
const { page, limit, search } = storeToRefs(tableStore);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShowList = computed(() => !!user?.value.user?.modules?.includes(actionModules.ESTIMATE.READ));

const budgetId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "estimateName", width: 25 },
    { id: 2, label: "estimateObject", width: 25 },
    { id: 3, label: "estimateAddress", width: 20 },
    { id: 4, label: "estimatePrice", width: 20 },
]);

const {
    data: budgets,
    isLoading: isLoadingBudgets,
    isSuccess: isSuccessBudgets,
    isError
} = await useQuery({
    queryKey: ["budgets", { 
        page, 
        limit, 
        debouncedSearch, 
        organizationId: user.value.user.organizationId, 
        name: user.value.user.fullName 
    }],
    queryFn: () => getList("budget", page.value, limit.value, debouncedSearch.value),
    enabled: isShowList
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("budget", idx),
    onSuccess: (response) => {
        if (!response?.success) return;

        queryClient.invalidateQueries({ queryKey: ["budgets"] });
        queryClient.invalidateQueries({ queryKey: ["budgetById", budgetId] });
        
        setTimeout(() => toast.success(t("deleteToast")), 150);
    }
});

const deleteHandler = async (idx) => {
    budgetId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped></style>
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
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useTableStore } from "@/store/tableStore";
import { useUserStore } from "@/store/userStore";
import { refDebounced } from "@vueuse/core";
import { 
    useQueryClient, 
    useQuery, 
    useMutation 
} from "@tanstack/vue-query";
import { getList, deleteWithId } from "@/services/crud.services.js";
import { routes } from "@/utils/routes.js";
import { actionModules } from "@/utils/action-modules.js";

const queryClient = useQueryClient();

const tableStore = useTableStore();
const { page, limit, search } = storeToRefs(tableStore);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShowList = computed(() => !!user?.value.user?.modules?.includes(actionModules.ESTIMATE.READ));

const budgetId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "estimateName" },
    { id: 2, label: "estimateObject" },
    { id: 3, label: "estimateAddress" },
    { id: 4, label: "estimatePrice" },
]);

const {
    data: budgets,
    isLoading: isLoadingBudgets,
    isSuccess: isSuccessBudgets,
    isError
} = await useQuery({
    queryKey: ["budgets", { page, limit, debouncedSearch, organizationId: user.value.user.organizationId, roleId: user.value.user.roleId }],
    queryFn: () => getList("budget", page.value, limit.value, debouncedSearch.value),
    enabled: isShowList
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("budget", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["budgets"] });
        queryClient.invalidateQueries({ queryKey: ["budgetsById", budgetId] });
    }
});

const deleteHandler = async (idx) => {
    budgetId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped></style>
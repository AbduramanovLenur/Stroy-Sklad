<template>
    <section class="expenses">
        <div class="expenses__inner section-padding">
            <HeadPage 
                title="expensesTitle" 
                :to="routes.CREATE_EXPENSES.path"
                @onSearch="($event) => setSearchValue($event)"
            />
            <Table 
                v-if="isSuccessExpenses && expenses?.count"
                :headers="headers" 
                :table="expenses?.cost"
                :to="routes.UPDATE_EXPENSES.name"
                :options="{ page, limit }"
                @onActionDelete="deleteHandler"
            />
            <Pagination
                :count="expenses?.count"
                :isSucces="isSuccessExpenses"
            />
            <Spinner v-if="isLoadingExpenses" />
            <div 
                v-if="(isSuccessExpenses && !expenses.count) || isError" 
                class="empty-table shadowed"
            >
                {{ $t("emptyTableTitle") }}
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useTableStore } from "@/store/tableStore";
import { refDebounced } from "@vueuse/core";
import { useQueryClient, useQuery, useMutation } from "@tanstack/vue-query";
import { getList, deleteWithId } from "@/services/crud.services.js";
import { routes } from "@/utils/routes.js";

const queryClient = useQueryClient();

const tableStore = useTableStore();
const { setSearchValue, setPagePagination } = tableStore;
const { page, limit, search } = storeToRefs(tableStore);

const organizationId = ref(localStorage.getItem("organizationId"));

onMounted(() => {
    setSearchValue("");
});

watch(search, () => {
    setPagePagination(1);
});

const expensesId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "expensesName", width: 635 },
    { id: 7, label: "expensesState" },
    { id: 8, label: "expensesAction" }
]);

const {
    data: expenses,
    isLoading: isLoadingExpenses,
    isSuccess: isSuccessExpenses,
    isError
} = await useQuery({
    queryKey: ["expenses", { page, limit, debouncedSearch, organizationId }],
    queryFn: () => getList("cost", page.value, limit.value, debouncedSearch.value, { organizationId: organizationId.value })
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("cost", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        queryClient.invalidateQueries({ queryKey: ["expensesById", expensesId] });
    }
});

const deleteHandler = async (idx) => {
    expensesId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped></style>
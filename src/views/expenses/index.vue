<template>
    <section class="expenses section-height">
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
                @onActionDelete="deleteHandler"
            />
            <Pagination
                :count="expenses?.count"
                :isSucces="isSuccessExpenses"
                :isEmpty="!!expenses?.count"
            />
            <Spinner v-if="isLoadingExpenses" />
            <div 
                v-if="(isSuccessExpenses && !expenses.count) || isError" 
                class="empty-table"
            >
                {{ $t("emptyTableTitle") }}
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useTableStore } from "@/store/tableStore";
import { refDebounced } from "@vueuse/core";
import { useQueryClient, useQuery, useMutation } from "@tanstack/vue-query";
import { getList, deleteWithId } from "@/services/crud.services.js";
import { routes } from "@/utils/routes.js";

const queryClient = useQueryClient();

const tableStore = useTableStore();
const { setSearchValue } = tableStore;
const { page, limit, search } = storeToRefs(tableStore);

onMounted(() => {
    setSearchValue("");
});

const expensesId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "expensesName", width: 635 },
    { id: 7, label: "expensesState", width: 440 },
    { id: 8, label: "expensesAction", width: 455 }
]);

const {
    data: expenses,
    isLoading: isLoadingExpenses,
    isSuccess: isSuccessExpenses,
    isError
} = await useQuery({
    queryKey: ["expenses", { page, limit, debouncedSearch }],
    queryFn: () => getList("cost", page.value, limit.value, debouncedSearch.value)
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
<template>
    <section class="warehouse">
        <div class="warehouse__inner section-padding">
            <HeadPage 
                title="warehouseTitle" 
                :to="routes.CREATE_WAREHOUSE.path"
                @onSearch="($event) => setSearchValue($event)"
            />
            <Table 
                v-if="isSuccessWarehouse && warehouse?.count"
                :headers="headers" 
                :table="warehouse?.warehouse"
                :to="routes.UPDATE_WAREHOUSE.name"
                :options="{ page, limit }"
                @onActionDelete="deleteHandler"
            />
            <Pagination
                :count="warehouse?.count"
                :isSucces="isSuccessWarehouse"
            />
            <Spinner v-if="isLoadingWarehouse" />
            <div 
                v-if="(isSuccessWarehouse && !warehouse?.count) || isError" 
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

const warehouseId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "warehouseName", width: 440 },
    { id: 2, label: "warehouseQuantity", width: 445 },
    { id: 3, label: "warehouseQuantityType", width: 205 },
    { id: 5, label: "warehouseState" },
    { id: 6, label: "warehouseAction" }
]);

const {
    data: warehouse,
    isLoading: isLoadingWarehouse,
    isSuccess: isSuccessWarehouse,
    isError
} = await useQuery({
    queryKey: ["warehouse", { page, limit, debouncedSearch, organizationId }],
    queryFn: () => getList("warehouse", page.value, limit.value, debouncedSearch.value)
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("warehouse", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["warehouse"] });
        queryClient.invalidateQueries({ queryKey: ["warehouseById", warehouseId] });
    }
});

const deleteHandler = async (idx) => {
    warehouseId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped></style>
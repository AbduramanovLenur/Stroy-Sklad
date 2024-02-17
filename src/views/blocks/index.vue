<template>
    <section class="blocks">
        <div class="blocks__inner section-padding">
            <HeadPage 
                title="blockTitle" 
                :to="routes.CREATE_BLOCKS.path"
                @onSearch="($event) => setSearchValue($event)"
            />
            <Table 
                v-if="isSuccessBlocks && blocks?.count"
                :headers="headers" 
                :table="blocks?.blocks"
                :to="routes.UPDATE_BLOCKS.name"
                :options="{ page, limit }"
                @onActionDelete="deleteHandler"
            />
            <Pagination
                :count="blocks?.count"
                :isSucces="isSuccessBlocks"
            />
            <Spinner v-if="isLoadingBlocks" />
            <div 
                v-if="(isSuccessBlocks && !blocks.count) || isError" 
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

const blocksId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "blockName", width: 225 },
    { id: 2, label: "blockObject", width: 250 },
    { id: 4, label: "blockFloors", width: 275 },
    { id: 5, label: "blockRooms", width: 285 },
    { id: 6, label: "blockAddress", width: 190 },
    { id: 7, label: "blockState" },
    { id: 8, label: "blockAction" }
]);

const {
    data: blocks,
    isLoading: isLoadingBlocks,
    isSuccess: isSuccessBlocks,
    isError
} = await useQuery({
    queryKey: ["blocks", { page, limit, debouncedSearch, organizationId }],
    queryFn: () => getList("building_block", page.value, limit.value, debouncedSearch.value)
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("building_block", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["blocks"] });
        queryClient.invalidateQueries({ queryKey: ["blocksById", blocksId] });
    }
});

const deleteHandler = async (idx) => {
    blocksId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped></style>
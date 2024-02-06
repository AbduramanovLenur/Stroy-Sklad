<template>
    <section class="blocks section-height">
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
                @onActionDelete="deleteHandler"
            />
            <Pagination
                :count="blocks?.count"
                :isSucces="isSuccessBlocks"
                :isEmpty="!!blocks?.count"
            />
            <Spinner v-if="isLoadingBlocks" />
            <div 
                v-if="(isSuccessBlocks && !blocks.count) || isError" 
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

const blocksId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "blockName", width: 185 },
    { id: 2, label: "blockObject", width: 205 },
    { id: 3, label: "blockOrganization", width: 260 },
    { id: 4, label: "blockFloors", width: 230 },
    { id: 5, label: "blockRooms", width: 235 },
    { id: 6, label: "blockAddress", width: 150 },
    { id: 7, label: "blockState", width: 140 },
    { id: 8, label: "blockAction", width: 125 }
]);

const {
    data: blocks,
    isLoading: isLoadingBlocks,
    isSuccess: isSuccessBlocks,
    isError
} = await useQuery({
    queryKey: ["blocks", { page, limit, debouncedSearch }],
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
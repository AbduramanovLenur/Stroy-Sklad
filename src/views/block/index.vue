<template>
    <section class="blocks" v-if="isShowList">
        <div class="blocks__inner section-padding">
            <HeadPage 
                title="blockTitle" 
                :to="routes.CREATE_BLOCK.path"
                :isShowCreate="user?.user?.modules?.includes(actionModules.BLOCK.CREATE)"
            />
            <Table 
                v-if="isSuccessBlocks && blocks?.count"
                :headers="headers" 
                :table="blocks?.blocks"
                :to="routes.UPDATE_BLOCK.name"
                :options="{ page, limit }"
                :isShowUpdate="user?.user?.modules?.includes(actionModules.BLOCK.UPDATE)"
                :isShowDelete="user?.user?.modules?.includes(actionModules.BLOCK.DELETE)"
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
import { ref, watch, onMounted, computed } from "vue";
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

const isShowList = computed(() => !!user?.value.user?.modules?.includes(actionModules.BLOCK.READ));

const blocksId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "blockName", width: 260 },
    { id: 2, label: "blockObject", width: 340 },
    { id: 4, label: "blockFloors", width: 200 },
    { id: 5, label: "blockRooms", width: 200 },
    { id: 6, label: "blockAddress", width: 250 }
]);

const {
    data: blocks,
    isLoading: isLoadingBlocks,
    isSuccess: isSuccessBlocks,
    isError
} = await useQuery({
    queryKey: ["blocks", { page, limit, debouncedSearch, organizationId: user.value.user.organizationId }],
    queryFn: () => getList("building_block", page.value, limit.value, debouncedSearch.value),
    enabled: isShowList
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("building_block", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["blocks"] });
        queryClient.invalidateQueries({ queryKey: ["blocksById", blocksId] });
        queryClient.invalidateQueries({ queryKey: ["blocksList"] });
    }
});

const deleteHandler = async (idx) => {
    blocksId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped></style>
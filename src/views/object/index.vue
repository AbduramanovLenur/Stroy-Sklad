<template>
    <section class="object" v-if="isShowList">
        <div class="object__inner section-padding">
            <HeadPage 
                title="objectTitle" 
                :to="routes.CREATE_OBJECT.path"
                :isShowCreate="user?.user?.modules?.includes(actionModules.OBJECT.CREATE)"
            />
            <Table 
                v-if="isSuccessObjects && objects?.count"
                :headers="headers" 
                :table="objects?.objects"
                :to="routes.UPDATE_OBJECT.name"
                :options="{ page, limit }"
                :isShowUpdate="user?.user?.modules?.includes(actionModules.OBJECT.UPDATE)"
                :isShowDelete="user?.user?.modules?.includes(actionModules.OBJECT.DELETE)"
                @onActionDelete="deleteHandler"
            />
            <Pagination
                :count="objects?.count"
                :isSucces="isSuccessObjects"
            />
            <Spinner v-if="isLoadingObjects" />
            <div 
                v-if="(isSuccessObjects && !objects?.count) || isError" 
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

const isShowList = computed(() => !!user?.value.user?.modules?.includes(actionModules.OBJECT.READ));

const objectsId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "objectName", width: 600 },
    { id: 3, label: "objectAddress", width: 600 }
]);

const {
    data: objects,
    isLoading: isLoadingObjects,
    isSuccess: isSuccessObjects,
    isError
} = await useQuery({
    queryKey: ["objects", { page, limit, debouncedSearch, organizationId: user.value.user.organizationId }],
    queryFn: () => getList("building_object", page.value, limit.value, debouncedSearch.value),
    enabled: isShowList
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("building_object", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["objects"] });
        queryClient.invalidateQueries({ queryKey: ["objectById", objectsId] });
        queryClient.invalidateQueries({ queryKey: ["objectsList"] });
        queryClient.invalidateQueries({ queryKey: ["blocks"] });
    }
});

const deleteHandler = async (idx) => {
    objectsId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped></style>
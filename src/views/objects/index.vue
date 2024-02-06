<template>
    <section class="object section-height">
        <div class="object__inner section-padding">
            <HeadPage 
                title="objectTitle" 
                :to="routes.CREATE_OBJECTS.path"
                @onSearch="($event) => setSearchValue($event)"
            />
            <div class="shadowed">
                <Table 
                    v-if="isSuccessObjects && objects?.count"
                    :headers="headers" 
                    :table="objects?.objects"
                    :to="routes.UPDATE_OBJECTS.name"
                    @onActionDelete="deleteHandler"
                />
                <Pagination
                    :count="objects?.count"
                    :isSucces="isSuccessObjects"
                    :isEmpty="!!objects?.count"
                />
                <Spinner v-if="isLoadingObjects" />
                <div 
                    v-if="(isSuccessObjects && !objects?.count) || isError" 
                    class="empty-table"
                >
                    {{ $t("emptyTableTitle") }}
                </div>
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

const objectsId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "objectName", width: 385 },
    { id: 2, label: "objectOrganization", width: 480 },
    { id: 3, label: "objectAddress", width: 185 },
    { id: 4, label: "objectState", width: 255 },
    { id: 5, label: "objectAction", width: 255 }
]);

const {
    data: objects,
    isLoading: isLoadingObjects,
    isSuccess: isSuccessObjects,
    isError
} = await useQuery({
    queryKey: ["objects", { page, limit, debouncedSearch }],
    queryFn: () => getList("building_object", page.value, limit.value, debouncedSearch.value)
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("building_object", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["objects"] });
        queryClient.invalidateQueries({ queryKey: ["objectById", objectsId] });
    }
});

const deleteHandler = async (idx) => {
    objectsId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped>
.object {
    &__form {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        @media (max-width: 1024px) {
            gap: 10px;
        }
        @media (max-width: 768px) {
            grid-template-columns: repeat(1, 1fr);
            gap: 20px;
        }
    }
}
</style>
<template>
    <section class="object section-height">
        <div class="object__inner section-padding">
            <HeadPage 
                title="objectTitle" 
                :to="routes.CREATE_OBJECTS.path"
                @onSearch="($event) => search = $event"
            />
            <Table 
                v-if="isSuccessObjects && objects.length"
                :headers="headers" 
                :table="objects"
                :to="routes.UPDATE_OBJECTS.name"
                @onActionDelete="deleteHandler"
            />
            <Spinner v-if="isLoadingObjects" />
            <div 
                v-if="(isSuccessObjects && !objects.length) || isError" 
                class="empty-table"
            >
                {{ $t("emptyTableTitle") }}
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref } from "vue";
import { useQueryClient, useQuery, useMutation } from "@tanstack/vue-query";
import { getList, deleteWithId } from "@/services/crud.services.js";
import { routes } from "@/utils/routes.js";

const queryClient = useQueryClient();

const search = ref("");
const companyId = ref("");

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
    queryKey: ["objects"],
    queryFn: () => getList("building_object")
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("building_object", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["objects"] });
        queryClient.invalidateQueries({ queryKey: ["objectById", companyId] });
    }
});

const deleteHandler = async (idx) => {
    companyId.value = idx;
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
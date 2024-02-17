<template>
    <section class="roles">
        <div class="roles__inner section-padding">
            <HeadPage 
                title="rolesTitle" 
                :to="routes.CREATE_ROLES.path"
                @onSearch="($event) => setSearchValue($event)"
            />
            <Table 
                v-if="isSuccessRoles && roles?.count"
                :headers="headers" 
                :table="roles?.roles"
                :to="routes.UPDATE_ROLES.name"
                :options="{ page, limit }"
                @onActionDelete="deleteHandler"
            />
            <Pagination
                :count="roles?.count"
                :isSucces="isSuccessRoles"
            />
            <Spinner v-if="isLoadingRoles" />
            <div 
                v-if="(isSuccessRoles && !roles?.count) || isError" 
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

const rolesId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "rolesName", width: 550 },
    { id: 3, label: "rolesState" },
    { id: 4, label: "rolesAction" }
]);

const {
    data: roles,
    isLoading: isLoadingRoles,
    isSuccess: isSuccessRoles,
    isError
} = await useQuery({
    queryKey: ["roles", { page, limit, debouncedSearch, organizationId }],
    queryFn: () => getList("Role", page.value, limit.value, debouncedSearch.value)
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("Role", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["roles"] });
        queryClient.invalidateQueries({ queryKey: ["rolesById", rolesId] });
    }
});

const deleteHandler = async (idx) => {
    rolesId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped></style>
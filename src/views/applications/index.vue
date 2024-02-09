<template>
    <section class="applications">
        <div class="applications__inner">
            <HeadPage 
                title="applicationTitle" 
                :to="routes.CREATE_APPLICATIONS.path"
                @onSearch="($event) => setSearchValue($event)"
            />
            <Table 
                v-if="isSuccessApplications && applications?.count"
                :headers="headers" 
                :table="applications?.applications"
                :to="routes.UPDATE_APPLICATIONS.name"
                :options="{ page, limit }"
                @onActionDelete="deleteHandler"
            />
            <Pagination
                :count="applications?.count"
                :isSucces="isSuccessApplications"
            />
            <Spinner v-if="isLoadingApplications" />
            <div 
                v-if="(isSuccessApplications && !applications.count) || isError"
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

const applicationId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "applicationUserName", width: 150 },
    { id: 2, label: "applicationOrganization", width: 220 },
    { id: 3, label: "applicationDedline", width: 265 },
    { id: 4, label: "applicationConstructionMaterial", width: 175 },
    { id: 5, label: "applicationObject", width: 115 },
    { id: 6, label: "applicationBlock", width: 105 },
    { id: 7, label: "applicationFloor", width: 100 },
    { id: 8, label: "applicationCost", width: 165 },
    { id: 9, label: "applicationState", width: 130 },
    { id: 9, label: "applicationAction", width: 110 }
]);

const {
    data: applications,
    isLoading: isLoadingApplications,
    isSuccess: isSuccessApplications,
    isError
} = await useQuery({
    queryKey: ["applications", { page, limit, debouncedSearch, organizationId }],
    queryFn: () => getList("api", page.value, limit.value, debouncedSearch.value, { organizationId: organizationId.value })
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("api", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["applications"] });
        queryClient.invalidateQueries({ queryKey: ["applicationsById", applicationId] });
    }
});

const deleteHandler = async (idx) => {
    applicationId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped></style>
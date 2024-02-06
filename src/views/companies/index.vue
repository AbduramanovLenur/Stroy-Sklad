<template>
    <section class="company section-height">
        <div class="company__inner section-padding">
            <HeadPage 
                title="comapnyTitle" 
                :to="routes.CREATE_COMPANIES.path"
                @onSearch="($event) => setSearchValue($event)"
            />
            <div class="shadowed">
                <Table 
                    v-if="isSuccessCompanies && companies?.count"
                    :headers="headers" 
                    :table="companies?.organizations" 
                    :to="routes.UPDATE_COMPANIES.name"
                    @onActionDelete="deleteHandler"
                />
                <Pagination
                    :count="companies?.count"
                    :isSucces="isSuccessCompanies"
                    :isEmpty="!!companies?.count"
                />
                <Spinner v-if="isLoadingCompanies" />
                <div 
                    v-if="(isSuccessCompanies && !companies?.count) || isError" 
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

const companyId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "organizationName", width: 220 },
    { id: 2, label: "organizationInn", width: 115 },
    { id: 3, label: "organizationRegion", width: 215 },
    { id: 4, label: "organizationDistrict", width: 155 },
    { id: 5, label: "organizationAddress", width: 200 },
    { id: 6, label: "organizationPhone", width: 170 },
    { id: 7, label: "organizationDirector", width: 245 },
    { id: 7, label: "organizationState", width: 100 },
    { id: 8, label: "organizationAction", width: 130 },
]);

const {
    data: companies,
    isLoading: isLoadingCompanies,
    isSuccess: isSuccessCompanies,
    isError
} = await useQuery({
    queryKey: ["companies", { page, limit, debouncedSearch }],
    queryFn: () => getList("organization", page.value, limit.value, debouncedSearch.value)
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("organization", idx),
    onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["companies"] });
        await queryClient.invalidateQueries({ queryKey: ["companiesById", companyId] });
    }
});

const deleteHandler = (idx) => {
    companyId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped></style>
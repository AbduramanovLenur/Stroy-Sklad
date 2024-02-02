<template>
    <section class="company section-height">
        <div class="company__inner section-padding">
            <HeadPage 
                title="comapnyTitle" 
                :to="routes.CREATE_COMPANIES.path"
                @onSearch="($event) => search = $event"
            />
            <Table 
                v-if="isSuccessCompanies && companies.length"
                :headers="headers" 
                :table="companies" 
                :to="routes.UPDATE_COMPANIES.name"
                @onActionDelete="deleteHandler"
            />
            <Spinner v-if="isLoadingCompanies" />
            <div 
                v-if="(isSuccessCompanies && !companies.length) || isError" 
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
    queryKey: ["companies", search],
    queryFn: () => getList("organization", search.value)
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("organization", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["companies"] });
        queryClient.invalidateQueries({ queryKey: ["companiesById", companyId] });
    }
});

const deleteHandler = (idx) => {
    companyId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped></style>
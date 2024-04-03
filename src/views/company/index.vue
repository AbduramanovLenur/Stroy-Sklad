<template>
    <section class="company section-height">
        <div class="company__inner section-padding">
            <HeadPage 
                title="comapnyTitle" 
                :to="routes.CREATE_COMPANIES.path"
            >
                {{ $t("addButton") }}
            </HeadPage>
            <Table 
                v-if="isSuccessCompanies && companies?.count"
                :headers="headers" 
                :table="companies?.organizations" 
                :to="routes.UPDATE_COMPANIES.name"
                :options="{ page, limit }"
                @onActionDelete="deleteHandler"
            />
            <Pagination
                :count="companies?.count"
                :isSucces="isSuccessCompanies"
            />
            <Spinner v-if="isLoadingCompanies" />
            <div 
                v-if="(isSuccessCompanies && !companies?.count) || isError" 
                class="empty-table shadowed"
            >
                {{ $t("emptyTableTitle") }}
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useTableStore } from "@/store/tableStore";
import { refDebounced } from "@vueuse/core";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { 
    useQueryClient, 
    useQuery, 
    useMutation 
} from "@tanstack/vue-query";
import { getList, deleteWithId } from "@/services/crud.services.js";
import { routes } from "@/utils/routes.js";

const queryClient = useQueryClient();

const toast = useToast();
const { t } = useI18n();

const tableStore = useTableStore();
const { page, limit, search } = storeToRefs(tableStore);

const companyId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "organizationName", width: 20 },
    { id: 2, label: "organizationInn", width: 10 },
    { id: 3, label: "organizationRegion", width: 15 },
    { id: 4, label: "organizationDistrict", width: 15 },
    { id: 5, label: "organizationAddress", width: 15 },
    { id: 6, label: "organizationPhone", width: 15 },
    { id: 7, label: "organizationDirector", width: 20 }
]);

const {
    data: companies,
    isLoading: isLoadingCompanies,
    isSuccess: isSuccessCompanies,
    isError
} = await useQuery({
    queryKey: ["companies", { page, limit, debouncedSearch }],
    queryFn: () => getList("organization", page.value, limit.value, debouncedSearch.value),
    select: (data) => {
        let companies = {...data};

        companies.organizations = data?.organizations.map((elem) => {
            const company = {
                ...elem,
                company: elem.organizationName,
            }

            delete company.organizationName;

            return company;
        })

        return companies;
    }
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("organization", idx),
    onSuccess: async (response) => {
        if (!response?.success) return;

        await queryClient.invalidateQueries({ queryKey: ["companies"] });
        await queryClient.invalidateQueries({ queryKey: ["companyById", companyId.value.toString()] });

        setTimeout(() => toast.success(t("deleteToast")), 150);
    }
});

const deleteHandler = (idx) => {
    companyId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped></style>
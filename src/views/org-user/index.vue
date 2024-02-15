<template>
    <section class="employees">
        <div class="employees__inner section-padding">
            <HeadPage
                title="employeesTitle" 
                :to="routes.CREATE_ORG_USER.path"
                @onSearch="($event) => setSearchValue($event)"
            />
            <Table 
                v-if="isSuccessEmployees && employees?.count"
                :headers="headers" 
                :table="employees?.users" 
                :to="routes.UPDATE_ORG_USER.name"
                :options="{ page, limit }"
                @onActionDelete="deleteHandler"
            />
            <Pagination
                :count="employees?.count"
                :isSucces="isSuccessEmployees"
            />
            <Spinner v-if="isLoadingEmployees" />
            <div 
                v-if="(isSuccessEmployees && !employees?.count) || isError" 
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

const employeesId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "employeesFullName", width: 300 },
    { id: 2, label: "employeesOrganization", width: 320 },
    { id: 3, label: "employeesPhone", width: 255 },
    { id: 4, label: "employeesRole", width: 195 },
    { id: 5, label: "employeesState" },
    { id: 8, label: "employeesAction" },
]);

const {
    data: employees,
    isLoading: isLoadingEmployees,
    isSuccess: isSuccessEmployees,
    isError
} = await useQuery({
    queryKey: ["orgUsers", { page, limit, debouncedSearch, organizationId }],
    queryFn: () => getList("user", page.value, limit.value, debouncedSearch.value),
    select: (data) => {
        let employees = {...data};
        employees.users = data?.users.map((elem) => {
            const employee = {
                ...elem,
                phone: elem.phoneNumber,
                company: elem.organizationName,
                name: elem.fullName
            }

            delete employee.fullName;
            delete employee.phoneNumber;
            delete employee.organizationName;

            return employee;
        })

        return employees;
    }
});

const { mutate: deleteMutate } = useMutation({
    mutationFn: (idx) => deleteWithId("user", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["orgUsers"] });
        queryClient.invalidateQueries({ queryKey: ["orgUserById", employeesId] });
    }
});

const deleteHandler = (idx) => {
    employeesId.value = idx;
    deleteMutate(idx);
}
</script>

<style lang="scss" scoped>
.employees {
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
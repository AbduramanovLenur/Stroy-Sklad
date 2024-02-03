<template>
    <section class="employees section-height">
        <div class="employees__inner section-padding">
            <HeadPage
                title="employeesTitle" 
                :to="routes.CREATE_EMPLOYEES.path"
                @onSearch="($event) => search = $event"
            />
            <Table 
                v-if="isSuccessEmployees && employees?.count"
                :headers="headers" 
                :table="employees?.users" 
                :to="routes.UPDATE_EMPLOYEES.name"
                @onActionDelete="deleteHandler"
            />
            <Pagination
                :count="employees?.count"
                :isSucces="isLoadingEmployees"
                :isEmpty="!!employees?.count"
            />
            <Spinner v-if="isLoadingEmployees" />
            <div 
                v-if="(isSuccessEmployees && !employees?.count) || isError" 
                class="empty-table"
            >
                {{ $t("emptyTableTitle") }}
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

const employeesId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "employeesFullName", width: 300 },
    { id: 2, label: "employeesOrganization", width: 320 },
    { id: 3, label: "employeesPhone", width: 255 },
    { id: 4, label: "employeesRole", width: 195 },
    { id: 5, label: "employeesState", width: 250 },
    { id: 8, label: "employeesAction", width: 190 },
]);

const {
    data: employees,
    isLoading: isLoadingEmployees,
    isSuccess: isSuccessEmployees,
    isError
} = await useQuery({
    queryKey: ["employees", { page, limit, debouncedSearch, isAdmin: true }],
    queryFn: () => getList("user", page.value, limit.value, debouncedSearch.value, true),
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
        queryClient.invalidateQueries({ queryKey: ["employees"] });
        queryClient.invalidateQueries({ queryKey: ["employeesById"] });
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
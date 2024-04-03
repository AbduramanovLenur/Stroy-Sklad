<template>
    <section class="employees">
        <div class="employees__inner section-padding">
            <HeadPage
                title="employeesTitle" 
                :to="routes.CREATE_EMPLOYEES.path"
            >
                {{ $t("addButton") }}
            </HeadPage>
            <Table 
                v-if="isSuccessEmployees && employees?.count"
                :headers="headers" 
                :table="employees?.users" 
                :to="routes.UPDATE_EMPLOYEES.name"
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
import { deleteWithId, getList } from "@/services/crud.services.js"
import { useTableStore } from "@/store/tableStore"
import { routes } from "@/utils/routes.js"
import {
    useMutation,
    useQuery,
    useQueryClient
} from "@tanstack/vue-query"
import { refDebounced } from "@vueuse/core"
import { storeToRefs } from "pinia"
import { ref } from "vue"
import { useI18n } from "vue-i18n"
import { useToast } from "vue-toastification"

const queryClient = useQueryClient();

const toast = useToast();
const { t } = useI18n();

const tableStore = useTableStore();
const { page, limit, search } = storeToRefs(tableStore);

const employeesId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "employeesFullName", width: 30 },
    { id: 2, label: "employeesOrganization", width: 30 },
    { id: 3, label: "employeesPhone", width: 20 },
    { id: 4, label: "employeesRole", width: 15 }
]);

const {
    data: employees,
    isLoading: isLoadingEmployees,
    isSuccess: isSuccessEmployees,
    isError
} = await useQuery({
    queryKey: ["employees", { page, limit, debouncedSearch }],
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
    onSuccess: (response) => {
        if (!response?.success) return;

        queryClient.invalidateQueries({ queryKey: ["employees"] });
        queryClient.invalidateQueries({ queryKey: ["employeeById", employeesId.value.toString()] });

        setTimeout(() => toast.success(t("deleteToast")), 150);
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
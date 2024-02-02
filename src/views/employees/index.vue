<template>
    <section class="employees section-height">
        <div class="employees__inner section-padding">
            <HeadPage
                title="employeesTitle" 
                :to="routes.CREATE_EMPLOYEES.path"
                @onSearch="($event) => search = $event"
            />
            <Table 
                v-if="isSuccessEmployees && employees.length"
                :headers="headers" 
                :table="employees" 
                :to="routes.UPDATE_EMPLOYEES.name"
                @onActionDelete="deleteHandler"
            />
            <Spinner v-if="isLoadingEmployees" />
            <div 
                v-if="(isSuccessEmployees && !employees.length) || isError" 
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
    queryKey: ["employees"],
    queryFn: () => getList("user"),
    select: (data) => {
        return data.map((elem) => {
            const employee = {
                ...elem,
                phone: elem.phoneNumber,
                company: elem.organizationName
            }

            delete employee.phoneNumber;
            delete employee.organizationName;

            return employee;
        })
    }
});

const { mutate: deleteMutate } = useMutation({
    mutationFn: (idx) => deleteWithId("user", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["employees"] });
        queryClient.invalidateQueries({ queryKey: ["employeesById", companyId] });
    }
});

const deleteHandler = (idx) => {
    companyId.value = idx;
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
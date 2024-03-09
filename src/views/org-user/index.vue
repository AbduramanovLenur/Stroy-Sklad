<template>
    <section class="employees" v-if="isShowList">
        <div class="employees__inner section-padding">
            <HeadPage
                title="employeesTitle" 
                :to="routes.CREATE_ORG_USER.path"
                :isShowCreate="user?.user?.modules?.includes(actionModules.ORG_USER.CREATE)"
            />
            <Table 
                v-if="isSuccessEmployees && employees?.count"
                :headers="headers" 
                :table="employees?.users" 
                :to="routes.UPDATE_ORG_USER.name"
                :options="{ page, limit }"
                :isShowUpdate="user?.user?.modules?.includes(actionModules.ORG_USER.UPDATE)"
                :isShowDelete="user?.user?.modules?.includes(actionModules.ORG_USER.DELETE)"
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
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useTableStore } from "@/store/tableStore";
import { useUserStore } from "@/store/userStore";
import { refDebounced } from "@vueuse/core";
import { 
    useQueryClient, 
    useQuery, 
    useMutation 
} from "@tanstack/vue-query";
import { getList, deleteWithId } from "@/services/crud.services.js";
import { routes } from "@/utils/routes.js";
import { actionModules } from "@/utils/action-modules.js";

const queryClient = useQueryClient();

const tableStore = useTableStore();
const { page, limit, search } = storeToRefs(tableStore);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShowList = computed(() => !!user?.value.user?.modules?.includes(actionModules.ORG_USER.READ));

const employeesId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "employeesFullName", width: 570 },
    { id: 3, label: "employeesPhone", width: 290 },
    { id: 4, label: "employeesRole", width: 310 }
]);

const {
    data: employees,
    isLoading: isLoadingEmployees,
    isSuccess: isSuccessEmployees,
    isError
} = await useQuery({
    queryKey: ["orgUsers", { page, limit, debouncedSearch, organizationId: user.value?.user?.organizationId }],
    queryFn: () => getList("user", page.value, limit.value, debouncedSearch.value),
    select: (data) => {
        let employees = {...data};
        employees.users = data?.users.map((elem) => {
            const employee = {
                ...elem,
                phone: elem.phoneNumber,
                name: elem.fullName
            }

            delete employee.fullName;
            delete employee.phoneNumber;

            return employee;
        })

        return employees;
    },
    enabled: isShowList
});

const { mutate: deleteMutate } = useMutation({
    mutationFn: (idx) => deleteWithId("user", idx),
    onSuccess: (response) => {
        // if (!response?.success) return;

        queryClient.invalidateQueries({ queryKey: ["orgUsers"] });
        queryClient.invalidateQueries({ queryKey: ["orgUserById", employeesId] });
    }
});

const deleteHandler = (idx) => {
    employeesId.value = idx;
    deleteMutate(idx);
}
</script>

<style lang="scss" scoped></style>
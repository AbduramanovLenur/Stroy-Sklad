<template>
    <section class="expenses" v-if="isShowList">
        <div class="expenses__inner section-padding">
            <HeadPage 
                title="expensesTitle" 
                :to="routes.CREATE_EXPENS.path"
                :isShowCreate="user?.user?.modules?.includes(actionModules.EXPENS.CREATE)"
            >
                {{ $t("addButton") }}
            </HeadPage>
            <Table 
                v-if="isSuccessExpenses && expenses?.count"
                :headers="headers" 
                :table="expenses?.expenses"
                :to="routes.VIEW_EXPENS.name"
                :options="{ page, limit }"
                :isShowUpdate="user?.user?.modules?.includes(actionModules.EXPENS.READ)"
                :isShowDelete="user?.user?.modules?.includes(actionModules.EXPENS.DELETE)"
                :isShowEye="true"
                @onActionDelete="deleteHandler"
            />
            <Pagination
                :count="expenses?.count"
                :isSucces="isSuccessExpenses"
            />
            <Spinner v-if="isLoadingExpenses" />
            <div 
                v-if="(isSuccessExpenses && !expenses.count) || isError" 
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
import { useUserStore } from "@/store/userStore"
import { actionModules } from "@/utils/action-modules.js"
import { routes } from "@/utils/routes.js"
import {
    useMutation,
    useQuery,
    useQueryClient
} from "@tanstack/vue-query"
import { refDebounced } from "@vueuse/core"
import { storeToRefs } from "pinia"
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useToast } from "vue-toastification"

const queryClient = useQueryClient();

const toast = useToast();
const { t } = useI18n();

const tableStore = useTableStore();
const { page, limit, search } = storeToRefs(tableStore);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShowList = computed(() => !!user?.value.user?.modules?.includes(actionModules.EXPENS.READ));

const expensId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "expensesObjectName", width: 15 },
    { id: 2, label: "expensesBlockName", width: 15 },
    { id: 3, label: "expensesFloorName", width: 10 },
    { id: 5, label: "expensesMaterial", width: 25 },
    { id: 6, label: "expensesCount", width: 10 },
    { id: 7, label: "expensesType", width: 30 }
]);

const {
    data: expenses,
    isLoading: isLoadingExpenses,
    isSuccess: isSuccessExpenses,
    isError
} = await useQuery({
    queryKey: ["expenses", { 
        page, 
        limit, 
        debouncedSearch, 
        organizationId: user.value.user.organizationId, 
        name: user.value.user.fullName 
    }],
    queryFn: () => getList("expense", page.value, limit.value, debouncedSearch.value),
    select: ({ expenses, count }) => {
        let array = [...expenses];

        array = array.map((elem) => {
            const expens = { ...elem, expensPrice: elem.price }

            delete expens.price;

            return expens;
        });

        return { expenses: array, count }
    },
    enabled: isShowList
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("expense", idx),
    onSuccess: (response) => {
        if (!response?.success) return;
        
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        queryClient.invalidateQueries({ queryKey: ["expensById", expensId.value.toString()] });

        setTimeout(() => toast.success(t("deleteToast")), 150);
    }
});

const deleteHandler = async (idx) => {
    expensId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped></style>
<template>
    <section class="expenses" v-if="isShowList">
        <div class="expenses__inner section-padding">
            <HeadPage 
                title="expensesTitle" 
                :to="routes.CREATE_EXPENS.path"
                :isShowCreate="user?.user?.modules?.includes(actionModules.EXPENS.CREATE)"
            />
            <Table 
                v-if="isSuccessExpenses && expenses?.count"
                :headers="headers" 
                :table="expenses?.cost"
                :to="routes.UPDATE_EXPENS.name"
                :options="{ page, limit }"
                :isShowUpdate="user?.user?.modules?.includes(actionModules.EXPENS.UPDATE)"
                :isShowDelete="user?.user?.modules?.includes(actionModules.EXPENS.DELETE)"
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
import { ref, watch, onMounted, computed } from "vue";
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

const isShowList = computed(() => !!user?.value.user?.modules?.includes(actionModules.EXPENS.READ));

const expensesId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "expensesName", width: 1040 }
]);

const {
    data: expenses,
    isLoading: isLoadingExpenses,
    isSuccess: isSuccessExpenses,
    isError
} = await useQuery({
    queryKey: ["expenses", { page, limit, debouncedSearch, organizationId: user.value.user.organizationId }],
    queryFn: () => getList("cost", page.value, limit.value, debouncedSearch.value),
    enabled: isShowList
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("cost", idx),
    onSuccess: (response) => {
        // if (!response?.success) return;
        
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        queryClient.invalidateQueries({ queryKey: ["expensesById", expensesId] });
        queryClient.invalidateQueries({ queryKey: ["costsList"] });
    }
});

const deleteHandler = async (idx) => {
    expensesId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped></style>
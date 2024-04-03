<template>
    <section class="costs" v-if="isShowList">
        <div class="costs__inner section-padding">
            <HeadPage 
                title="applicationCost" 
                :to="routes.CREATE_COST.path"
                :isShowCreate="user?.user?.modules?.includes(actionModules.COST.CREATE)"
            >
                {{ $t("addButton") }}
            </HeadPage>
            <Table 
                v-if="isSuccessCosts && costs?.count"
                :headers="headers" 
                :table="costs?.cost"
                :to="routes.UPDATE_COST.name"
                :options="{ page, limit }"
                :isShowUpdate="user?.user?.modules?.includes(actionModules.COST.UPDATE)"
                :isShowDelete="user?.user?.modules?.includes(actionModules.COST.DELETE)"
                @onActionDelete="deleteHandler"
            />
            <Pagination
                :count="costs?.count"
                :isSucces="isSuccessCosts"
            />
            <Spinner v-if="isLoadingCosts" />
            <div 
                v-if="(isSuccessCosts && !costs.count) || isError" 
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
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { 
    useQueryClient, 
    useQuery, 
    useMutation 
} from "@tanstack/vue-query";
import { getList, deleteWithId } from "@/services/crud.services.js";
import { routes } from "@/utils/routes.js";
import { actionModules } from "@/utils/action-modules.js";

const queryClient = useQueryClient();

const toast = useToast();
const { t } = useI18n();

const tableStore = useTableStore();
const { page, limit, search } = storeToRefs(tableStore);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShowList = computed(() => !!user?.value.user?.modules?.includes(actionModules.COST.READ));

const costId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "costsName", width: 70 }
]);

const {
    data: costs,
    isLoading: isLoadingCosts,
    isSuccess: isSuccessCosts,
    isError
} = await useQuery({
    queryKey: ["costs", { 
        page, 
        limit, 
        debouncedSearch, 
        organizationId: user.value.user.organizationId, 
        name: user.value.user.fullName 
    }],
    queryFn: () => getList("cost", page.value, limit.value, debouncedSearch.value),
    enabled: isShowList
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("cost", idx),
    onSuccess: (response) => {
        if (!response?.success) return;
        
        queryClient.invalidateQueries({ queryKey: ["costs"] });
        queryClient.invalidateQueries({ queryKey: ["costById", costId.value.toString()] });
        queryClient.invalidateQueries({ queryKey: ["costsList"] });

        setTimeout(() => toast.success(t("deleteToast")), 150);
    }
});

const deleteHandler = async (idx) => {
    costId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped></style>
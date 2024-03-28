<template>
    <section class="warehouse" v-if="isShowList">
        <div class="warehouse__inner section-padding">
            <HeadPage 
                title="warehouseTitle" 
                :to="routes.CREATE_WAREHOUSE.path"
                :isShowCreate="user?.user?.modules?.includes(actionModules.WAREHOUSE.CREATE)"
            />
            <Table 
                v-if="isSuccessWarehouse && warehouse?.count"
                :headers="headers" 
                :table="warehouse?.warehouse"
                :to="routes.UPDATE_WAREHOUSE.name"
                :options="{ page, limit }"
                :isShowUpdate="user?.user?.modules?.includes(actionModules.WAREHOUSE.UPDATE)"
                :isShowDelete="user?.user?.modules?.includes(actionModules.WAREHOUSE.DELETE)"
                @onActionDelete="deleteHandler"
            />
            <Pagination
                :count="warehouse?.count"
                :isSucces="isSuccessWarehouse"
            />
            <Spinner v-if="isLoadingWarehouse" />
            <div 
                v-if="(isSuccessWarehouse && !warehouse?.count) || isError" 
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

const isShowList = computed(() => !!user?.value.user?.modules?.includes(actionModules.WAREHOUSE.READ));

const warehouseId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "warehouseName", width: 35 },
    { id: 2, label: "warehouseQuantity", width: 20 },
    { id: 3, label: "warehouseQuantityType", width: 20 }
]);

const {
    data: warehouse,
    isLoading: isLoadingWarehouse,
    isSuccess: isSuccessWarehouse,
    isError
} = await useQuery({
    queryKey: ["warehouse", { 
        page, 
        limit, 
        debouncedSearch, 
        organizationId: user.value.user.organizationId, 
        name: user.value.user.fullName 
    }],
    queryFn: () => getList("warehouse", page.value, limit.value, debouncedSearch.value),
    enabled: isShowList
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("warehouse", idx),
    onSuccess: (response) => {
        if (!response?.success) return;

        queryClient.invalidateQueries({ queryKey: ["warehouse"] });
        queryClient.invalidateQueries({ queryKey: ["warehouseById", warehouseId] });

        setTimeout(() => toast.success(t("deleteToast")), 150);
    }
});

const deleteHandler = async (idx) => {
    warehouseId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped></style>
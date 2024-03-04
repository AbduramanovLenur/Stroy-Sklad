<template>
    <section class="roles" v-if="isShowList">
        <div class="roles__inner section-padding">
            <HeadPage 
                title="rolesTitle" 
                :to="routes.CREATE_ROLE.path"
                :isShowCreate="user?.user?.modules?.includes(actionModules.ROLE.CREATE)"
            />
            <Table 
                v-if="isSuccessRoles && roles?.count"
                :headers="headers" 
                :table="roles?.roles"
                :to="routes.UPDATE_ROLE.name"
                :options="{ page, limit }"
                :isShowUpdate="user?.user?.modules?.includes(actionModules.ROLE.UPDATE)"
                :isShowDelete="user?.user?.modules?.includes(actionModules.ROLE.DELETE)"
                @onActionDelete="deleteHandler"
            />
            <Pagination
                :count="roles?.count"
                :isSucces="isSuccessRoles"
            />
            <Spinner v-if="isLoadingRoles" />
            <div 
                v-if="(isSuccessRoles && !roles?.count) || isError" 
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

const isShowList = computed(() => !!user?.value.user?.modules?.includes(actionModules.ROLE.READ));

const rolesId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "rolesName", width: 1150 }
]);

const {
    data: roles,
    isLoading: isLoadingRoles,
    isSuccess: isSuccessRoles,
    isError
} = await useQuery({
    queryKey: ["roles", { page, limit, debouncedSearch, organizationId: user.value.user.organizationId }],
    queryFn: () => getList("Role", page.value, limit.value, debouncedSearch.value),
    enabled: isShowList
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("Role", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["roles"] });
        queryClient.invalidateQueries({ queryKey: ["rolesById", rolesId] });
        queryClient.invalidateQueries({ queryKey: ["rolesList"] });
    }
});

const deleteHandler = async (idx) => {
    rolesId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped></style>
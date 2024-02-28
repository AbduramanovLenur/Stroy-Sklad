<template>
    <section class="applications" v-if="isShowList">
        <div class="applications__inner">
            <HeadPage 
                title="applicationTitle" 
                :to="routes.CREATE_APPLICATION.path"
                :isShowCreate="user?.user?.modules?.includes(actionModules.APPLICATION.CREATE)"
            />
            <Table 
                v-if="isSuccessApplications && applications?.count"
                :headers="headers" 
                :table="applications?.applications"
                :to="routes.VIEW_APPLICATION.name"
                :options="{ page, limit }"
                :isShowEye="true"
                :isShowUpdate="user?.user?.modules?.includes(actionModules.APPLICATION.UPDATE)"
                :isShowDelete="user?.user?.modules?.includes(actionModules.APPLICATION.DELETE)"
                @onActionDelete="deleteHandler"
            />
            <Pagination
                :count="applications?.count"
                :isSucces="isSuccessApplications"
            />
            <Spinner v-if="isLoadingApplications" />
            <div 
                v-if="(isSuccessApplications && !applications.count) || isError"
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

const isShowList = computed(() => !!user?.value.user?.modules?.includes(actionModules.APPLICATION.READ));

const applicationId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "applicationUserName", width: 190 },
    { id: 3, label: "applicationDocDate", width: 230 },
    { id: 4, label: "applicationDedline", width: 230 },
    { id: 5, label: "applicationObject", width: 250 },
    { id: 6, label: "applicationBlock", width: 250 }
]);

const {
    data: applications,
    isLoading: isLoadingApplications,
    isSuccess: isSuccessApplications,
    isError
} = await useQuery({
    queryKey: ["applications", { page, limit, debouncedSearch, organizationId: user.value.user.organizationId, roleId: user.value.user.roleId }],
    queryFn: () => getList("application", page.value, limit.value, debouncedSearch.value),
    select: (data) => {
        let applications = {...data};

        applications.applications = applications?.applications.map((elem) => {
            const application = {
                ...elem,
                name: elem.userName,
            }

            delete application.userName;
            delete application.organizationName;
            delete application.state;
            delete application.stateId;

            return application;
        })

        return applications;
    },
    enabled: isShowList
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("application", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["applications"] });
        queryClient.invalidateQueries({ queryKey: ["applicationsById", applicationId] });
    }
});

const deleteHandler = async (idx) => {
    applicationId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped></style>
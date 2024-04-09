<template>
    <section class="applications" v-if="isShowList">
        <div class="applications__inner">
            <HeadPage 
                title="applicationTitle" 
                :to="routes.CREATE_APPLICATION.path"
                :isShowCreate="user?.user?.modules?.includes(actionModules.APPLICATION.CREATE)"
            >
                {{ $t("createButton") }}
            </HeadPage>
            <Table 
                v-if="isSuccessApplications && applications?.count"
                :headers="headers" 
                :table="applications?.applications"
                :to="routes.VIEW_APPLICATION.name"
                :options="{ page, limit }"
                :isShowUpdate="user?.user?.modules?.includes(actionModules.APPLICATION.READ)"
                :isShowDelete="user?.user?.modules?.includes(actionModules.APPLICATION.DELETE)"
                :isShowEye="true"
                className="table-action"
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

const isShowList = computed(() => !!user?.value.user?.modules?.includes(actionModules.APPLICATION.READ));

const applicationId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "applicationUserName", width: 12 }, // 12
    { id: 3, label: "applicationDocDate", width: 14.6 }, // 14.6
    { id: 4, label: "applicationDedline", width: 14.6 }, // 14.6
    { id: 5, label: "applicationObject", width: 16 },
    { id: 6, label: "applicationBlock", width: 16 }
]);

const {
    data: applications,
    isLoading: isLoadingApplications,
    isSuccess: isSuccessApplications,
    isError
} = await useQuery({
    queryKey: ["applications", { 
        page, 
        limit, 
        debouncedSearch, 
        organizationId: user.value.user.organizationId, 
        name: user.value.user.fullName
    }],
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
    onSuccess: (response) => {
        if (!response.success) return;

        queryClient.invalidateQueries({ queryKey: ["applications"] });
        queryClient.invalidateQueries({ queryKey: ["applicationsById", applicationId.value.toString()] });

        setTimeout(() => toast.success(t("deleteToast")), 150);
    }
});

const deleteHandler = async (idx) => {
    applicationId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped></style>
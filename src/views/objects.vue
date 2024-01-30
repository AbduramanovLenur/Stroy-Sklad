<template>
    <section class="object">
        <div class="object__inner section-padding">
            <HeadPage 
                title="objectTitle" 
                @onSearch="($event) => objectsForm.search = $event"
                @onOpenFormModal="() => companiesHandler('create')"
            />
            <Table 
                v-if="isSuccessObjects && objects.length"
                :headers="headers" 
                :table="objects" 
                @onActionEdit="($event) => companiesHandler('edit', $event)"
                @onActionDelete="deleteObjectHandler"
            />
            <Spinner 
                v-if="isLoadingObjects" 
            />
            <div 
                v-if="(isSuccessObjects && !objects.length) || isError" 
                class="empty-table"
            >
                {{ $t("emptyTableTitle") }}
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@/utils/i18n-validators.js";
import { 
    useQueryClient, 
    useQuery, 
    useMutation 
} from "@tanstack/vue-query";
import { useModalsStore } from "@/store/modalsStore.js";
import { 
    objectGetList,
    objectDeleteWithId
} from "@/services/object.services.js";


const queryClient = useQueryClient();

const objectsForm = ref({
    search: ""
});

const headers = ref([
    { id: 1, label: "objectName" },
    { id: 2, label: "objectOrganization" },
    { id: 3, label: "objectAddress" },
    { id: 4, label: "objectState" },
    { id: 5, label: "objectAction" }
]);

const {
    data: objects,
    isLoading: isLoadingObjects,
    isSuccess: isSuccessObjects,
    isError
} = await useQuery({
    queryKey: ["objects"],
    queryFn: () => objectGetList()
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => objectDeleteWithId(idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["objects"] });
    }
});

const deleteObjectHandler = async (idx) => {
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped>

</style>
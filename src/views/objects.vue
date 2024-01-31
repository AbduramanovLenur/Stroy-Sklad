<template>
    <section class="object">
        <div class="object__inner section-padding">
            <HeadPage 
                title="objectTitle" 
                @onSearch="($event) => objectsForm.search = $event"
                @onOpenFormModal="() => objectHandler('create')"
            />
            <Table 
                v-if="isSuccessObjects && objects.length"
                :headers="headers" 
                :table="objects" 
                @onActionEdit="($event) => objectHandler('edit', $event)"
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
        <FormModal :title="titleModal">
            <form class="object__form" @submit.prevent="submitFormHandler">
                <FormInput 
                    v-for="input in inputs"
                    :key="input.id"
                    v-model="objectsForm[input.model]"
                    :width="500" 
                    :placeholder="$t(input.placeholder)"
                    :name="input.icon"
                    :error="v$?.[input.errorKey].$error" 
                    :textError="v$?.[input.errorKey].$errors[0]?.$message"
                >
                    {{ $t(input.label) }}
                </FormInput>
                <FormSelect 
                    v-for="select in selects"
                    :key="select.id"
                    v-model="objectsForm[select.model]" 
                    :width="500" 
                    :options="select.options"
                    :error="v$?.[select?.errorKey]?.$error" 
                    :textError="v$?.[select?.errorKey]?.$errors[0]?.$message"
                    :success="select.success"
                    :loading="select.loading"
                    :show="select?.show"
                    :requestFlag="requestFlag"
                >
                    {{ $t(select.label) }}
                </FormSelect>
                <CustomButton 
                    :className="`form__submit ${v$?.districtId.$errors[0]?.$message ? 'centered' : ''}`"
                >
                    {{ $t("formButton") }}
                </CustomButton>
            </form>
        </FormModal>
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
    getList, 
    getWithId, 
    create, 
    updateById, 
    deleteWithId 
} from "@/services/crud.services.js";
import {
    manualGetRegions,
    manualGetDistricts,
    manualGetStates
} from "@/services/manual.services.js";
import { clearForm } from "@/utils/secondary-functions.js";


const queryClient = useQueryClient();

const modalsStore = useModalsStore();
const { toggleIsOpenModalForm } = modalsStore;
const { isOpenModalForm } = storeToRefs(modalsStore);

const titleModal = ref("addNewObjectTitle");
const requestFlag = ref("");
const requestId = ref(0);

const isEnabled = computed(() => isOpenModalForm);
const isEdit = computed(() => isOpenModalForm && requestFlag.value === 'edit');

const {
    data: regions,
    isSuccess: isSuccessRegions,
    isLoading: isLoadingRegions
} = await useQuery({
    queryKey: ["regions"],
    queryFn: () => manualGetRegions(),
    enabled: isEnabled
});

const {
    data: districts,
    isSuccess: isSuccessDistricts,
    isLoading: isLoadingDistricts
} = await useQuery({
    queryKey: ["districts"],
    queryFn: () => manualGetDistricts(),
    enabled: isEnabled
});

const {
    data: states,
    isSuccess: isSuccessStates,
    isLoading: isLoadingStates
} = await useQuery({
    queryKey: ["states"],
    queryFn: () => manualGetStates(),
    enabled: isEdit
});

const objectsForm = ref({
    id: "",
    name: "",
    organizationId: "",
    regionId: "",
    districtId: "",
    address: "",
    stateId: "",
    search: ""
});

const rules = computed(() => ({
    name: { required },
    organizationId: { required },
    regionId: { required },
    districtId: { required },
    address: { required },
}));

const headers = ref([
    { id: 1, label: "objectName" },
    { id: 2, label: "objectOrganization" },
    { id: 3, label: "objectAddress" },
    { id: 4, label: "objectState" },
    { id: 5, label: "objectAction" }
]);

const inputs = ref([
    { 
        id: 1, 
        model: "name", 
        label: "nameObjectLabel", 
        placeholder: "nameObjectPlaceholder", 
        icon: "input-company",
        errorKey: "name",
    },
    { 
        id: 2, 
        model: "address", 
        label: "addressObjectLabel", 
        placeholder: "addressObjectPlaceholder", 
        icon: "address",
        errorKey: "address",
    },
]);

const selects = ref([
    { 
        id: 1, 
        model: "regionId", 
        label: "regionObjectLabel", 
        options: regions,
        errorKey: "regionId",
        success: isSuccessRegions,
        loading: isLoadingRegions,
        show: ["create", "edit"]
    },
    { 
        id: 2, 
        model: "districtId", 
        label: "districtObjectLabel", 
        options: districts,
        errorKey: "districtId",
        success: isSuccessDistricts,
        loading: isLoadingDistricts,
        show: ["create", "edit"]
    },
    { 
        id: 3, 
        model: "stateId", 
        label: "stateObjectLabel", 
        options: states,
        success: isSuccessStates,
        loading: isLoadingStates,
        show: "update",
        show: ["edit"]
    }
]);

const v$ = useVuelidate(rules, objectsForm);

const {
    data: objects,
    isLoading: isLoadingObjects,
    isSuccess: isSuccessObjects,
    isError
} = await useQuery({
    queryKey: ["objects"],
    queryFn: () => getList("building_object")
});

const {} = await useQuery({
    queryKey: ["objectById", requestId],
    queryFn: () => getWithId("building_object", requestId.value),
    select: (data) => {
        objectsForm.value.id = data.id;
        objectsForm.value.name = data.fullname;
        objectsForm.value.organizationId = data.organizationId;
        objectsForm.value.regionId = data.regionId;
        objectsForm.value.districtId = data.districtId;
        objectsForm.value.address = data.address;
        objectsForm.value.stateId = data.stateId;
    },
    enabled: isEdit
});

const { mutate: createMutate } = useMutation({
    mutationFn: (body) => create("building_object", body),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["objects"] });
    }
});

const { mutate: updateMutate } = useMutation({
    mutationFn: (body) => updateById("building_object", body),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["objects"] });
        queryClient.invalidateQueries({ queryKey: ["objectById", requestId] });
    }
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("building_object", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["objects"] });
        queryClient.invalidateQueries({ queryKey: ["objectById", requestId] });
    }
});

const isOpenFormModal = (title, flag) => {
    titleModal.value = title;
    requestFlag.value = flag;
    toggleIsOpenModalForm();

    if (requestFlag.value === "create" && isOpenModalForm.value) {
        objectsForm.value = clearForm(objectsForm.value);
        v$.value.$reset();
    }
}

const objectHandler = (flag, idx) => {
    if (flag === "edit" && idx) {
        requestId.value = idx;
        isOpenFormModal("editObjectTitle", "edit");
        return;
    }

    isOpenFormModal("addNewObjectTitle", "create");
}

const deleteObjectHandler = async (idx) => {
    mutateDelete(idx);
}

const submitFormHandler = async () => {

    // const organizationId = localStorage.getItem("organizationId");
    const organizationId = 1;
    objectsForm.value.organizationId = organizationId;

    v$.value.$validate();

    if (v$.value.$errors.length) {
        return;
    }

    if (requestFlag.value === "create") {
        delete objectsForm.value.id;
        delete objectsForm.value.stateId;
        delete objectsForm.value.search;

        createMutate(objectsForm.value);
    } else {
        updateMutate(objectsForm.value);
    }

    objectsForm.value = clearForm(objectsForm.value);
    toggleIsOpenModalForm();
    v$.value.$reset();
}
</script>

<style lang="scss" scoped>
.object {
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
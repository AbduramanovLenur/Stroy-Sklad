<template>
    <section class="company">
        <div class="company__inner section-padding">
            <HeadPage 
                title="comapnyTitle" 
                @onSearch="($event) => companiesForm.search = $event"
                @onOpenFormModal="() => companiesHandler('create')"
            />
            <Table 
                v-if="isSuccessCompanies && companies.length"
                :headers="headers" 
                :table="companies" 
                @onActionEdit="($event) => companiesHandler('edit', $event)"
                @onActionDelete="deleteCompanyHandler"
            />
            <Spinner 
                v-if="isLoadingCompanies" 
            />
            <div 
                v-if="(isSuccessCompanies && !companies.length) || isError" 
                class="empty-table"
            >
                {{ $t("emptyTableTitle") }}
            </div>
        </div>
        <FormModal :title="titleModal">
            <form class="company__form" @submit.prevent="submitFormHandler">
                <FormInput 
                    v-for="input in inputs"
                    :key="input.id"
                    v-model="companiesForm[input.model]"
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
                    v-model="companiesForm[select.model]" 
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
    adminGetList, 
    adminGetWithId, 
    adminCreate, 
    adminUpdateById, 
    adminDeleteWithId 
} from "@/services/superadmin_crud.services.js";
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

const titleModal = ref("addNewCompanyTitle");
const requestFlag = ref("");
const requestId = ref(0);

const isCreateForm = computed(() => isOpenModalForm);
const isEditForm = computed(() => isOpenModalForm && requestFlag.value == "edit");

const {
    data: regions,
    isSuccess: isSuccessRegions,
    isLoading: isLoadingRegions
} = await useQuery({
    queryKey: ["regions"],
    queryFn: () => manualGetRegions(),
    enabled: isCreateForm
});

const {
    data: districts,
    isSuccess: isSuccessDistricts,
    isLoading: isLoadingDistricts
} = await useQuery({
    queryKey: ["districts"],
    queryFn: () => manualGetDistricts(),
    enabled: isCreateForm
});

const {
    data: states,
    isSuccess: isSuccessStates,
    isLoading: isLoadingStates
} = await useQuery({
    queryKey: ["states"],
    queryFn: () => manualGetStates(),
    enabled: isEditForm
});

const companiesForm = ref({
    id: "",
    fullName: "",
    inn: "",
    address: "",
    phoneNumber: "",
    director: "",
    regionId: "",
    districtId: "",
    stateId: "",
    search: ""
});

const rules = computed(() => ({
    fullName: { required },
    inn: { required },
    address: { required },
    phoneNumber: { required },
    director: { required },
    regionId: { required },
    districtId: { required },
}));

const headers = ref([
    { id: 1, label: "organizationName", width: 220 },
    { id: 2, label: "organizationInn", width: 115 },
    { id: 3, label: "organizationRegion", width: 215 },
    { id: 4, label: "organizationDistrict", width: 155 },
    { id: 5, label: "organizationAddress", width: 200 },
    { id: 6, label: "organizationPhone", width: 170 },
    { id: 7, label: "organizationDirector", width: 245 },
    { id: 7, label: "organizationState", width: 100 },
    { id: 8, label: "organizationAction", width: 130 },
]);

const inputs = ref([
    { 
        id: 1, 
        model: "fullName", 
        label: "nameOrganizationLabel", 
        placeholder: "nameOrganizationPlaceholder", 
        icon: "input-company",
        errorKey: "fullName",
    },
    { 
        id: 2, 
        model: "inn", 
        label: "innOrganizationLabel", 
        placeholder: "innOrganizationPlaceholder", 
        icon: "tin",
        errorKey: "inn",
    },
    { 
        id: 3, 
        model: "address", 
        label: "addressOrganizationLabel", 
        placeholder: "addressOrganizationPlaceholder", 
        icon: "address",
        errorKey: "address",
    },
    { 
        id: 4, 
        model: "phoneNumber", 
        label: "phoneOrganizationLabel", 
        placeholder: "phoneOrganizationPlaceholder", 
        icon: "phone",
        errorKey: "phoneNumber",
    },
    { 
        id: 5, 
        model: "director", 
        label: "directorOrganizationLabel", 
        placeholder: "directorOrganizationPlaceholder", 
        icon: "person",
        errorKey: "director",
    }
]);

const selects = ref([
    { 
        id: 1, 
        model: "regionId", 
        label: "regionOrganizationLabel", 
        options: regions,
        errorKey: "regionId",
        success: isSuccessRegions,
        loading: isLoadingRegions,
        show: ["create", "edit"]
    },
    { 
        id: 2, 
        model: "districtId", 
        label: "districtOrganizationLabel", 
        options: districts,
        errorKey: "districtId",
        success: isSuccessDistricts,
        loading: isLoadingDistricts,
        show: ["create", "edit"]
    },
    { 
        id: 3, 
        model: "stateId", 
        label: "stateOrganizationLabel", 
        options: states,
        success: isSuccessStates,
        loading: isLoadingStates,
        show: "update",
        show: ["edit"]
    }
]);

const v$ = useVuelidate(rules, companiesForm);

const {
    data: companies,
    isLoading: isLoadingCompanies,
    isSuccess: isSuccessCompanies,
    isError
} = await useQuery({
    queryKey: ["companies"],
    queryFn: () => adminGetList("organization")
});

const {} = await useQuery({
    queryKey: ["companiesById", requestId],
    queryFn: () => adminGetWithId("organization", requestId.value),
    select: (data) => {
        companiesForm.value.id = data.id;
        companiesForm.value.fullName = data.fullName;
        companiesForm.value.inn = data.inn;
        companiesForm.value.address = data.address;
        companiesForm.value.phoneNumber = data.phoneNumber;
        companiesForm.value.director = data.director;
        companiesForm.value.regionId = data.regionId;
        companiesForm.value.districtId = data.districtId;
        companiesForm.value.stateId = data.stateId;
    },
    enabled: isEditForm
});

const { mutate: createMutate } = useMutation({
    mutationFn: (body) => adminCreate("organization", body),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["companies"] });
    }
});

const { mutate: updateMutate } = useMutation({
    mutationFn: (body) => adminUpdateById("organization", body),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["companies"] });
        queryClient.invalidateQueries({ queryKey: ["companiesById", requestId] });
    }
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => adminDeleteWithId("organization", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["companies"] });
        queryClient.invalidateQueries({ queryKey: ["companiesById", requestId] });
    }
});

const isOpenFormModal = (title, flag) => {
    titleModal.value = title;
    requestFlag.value = flag;
    toggleIsOpenModalForm();

    if (requestFlag.value === "create" && isOpenModalForm.value) {
        companiesForm.value = clearForm(companiesForm.value);
        v$.value.$reset();
    }
}

const companiesHandler = (flag, idx) => {
    if (flag === "edit" && idx) {
        requestId.value = idx;
        isOpenFormModal("editCompanyTitle", "edit");
        return;
    }

    isOpenFormModal("addNewCompanyTitle", "create");
}

const deleteCompanyHandler = async (idx) => {
    mutateDelete(idx);
}

const submitFormHandler = async () => {
    v$.value.$validate();

    if (v$.value.$errors.length) {
        return;
    }

    if (requestFlag.value === "create") {
        delete companiesForm.value.id;
        delete companiesForm.value.stateId;

        createMutate(companiesForm.value);
    } else {
        updateMutate(companiesForm.value);
    }

    toggleIsOpenModalForm();
    companiesForm.value = clearForm(companiesForm.value);
    v$.value.$reset();
}
</script>

<style lang="scss" scoped>
.company {
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
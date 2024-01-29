<template>
    <section class="company">
        <div class="company__inner">
            <div class="company__head">
                <Title>
                    {{ $t("comapnyTitle") }}
                </Title>
                <FormSearch 
                    @onSearch="($event) => companyForm.search = $event" 
                />
                <AddButton
                    @onOpenFormModal="createNewCompanyHandler"
                />
            </div>
            <Table 
                v-if="isSuccessCompanies && companies.length"
                :headers="headers" 
                :table="companies" 
                @onActionEdit="editCompanyHandler"
                @onActionDelete="deleteCompanyHandler"
            />
            <Spinner 
                v-if="isLoadingCompanies" 
            />
            <div 
                v-if="isSuccessCompanies && !companies.length" 
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
                    v-model="companyForm[input.model]"
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
                    v-model="companyForm[select.model]" 
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
import Title from "@/components/Title.vue";
import FormSearch from "@/components/FormSearch.vue";
import AddButton from "@/components/AddButton.vue";
import Table from "@/components/Table.vue";
import FormModal from "@/components/FormModal.vue";
import FormInput from "@/components/FormInput.vue";
import FormSelect from "@/components/FormSelect.vue";
import CustomButton from "@/components/CustomButton.vue";
import Spinner from "@/components/Spinner.vue";

const queryClient = useQueryClient();

const modalsStore = useModalsStore();
const { toggleIsOpenModalForm } = modalsStore;
const { isOpenModalForm } = storeToRefs(modalsStore);

const titleModal = ref("addNewCompanyTitle");
const requestFlag = ref("");
const requestId = ref("");

const isCreateForm = computed(() => isOpenModalForm);
const isEditForm = computed(() => isOpenModalForm && requestFlag.value == 'edit');

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
    queryKey: ["statesCompany"],
    queryFn: () => manualGetStates(),
    enabled: isEditForm
});

const companyForm = ref({
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

const v$ = useVuelidate(rules, companyForm);

const {
    data: companies,
    isLoading: isLoadingCompanies,
    isSuccess: isSuccessCompanies
} = await useQuery({
    queryKey: ["companies"],
    queryFn: () => adminGetList("organization")
});

const {} = await useQuery({
    queryKey: ["companiesById", requestId],
    queryFn: () => adminGetWithId("organization", requestId.value),
    select: (data) => {
        companyForm.value.id = data.id;
        companyForm.value.fullName = data.fullName;
        companyForm.value.inn = data.inn;
        companyForm.value.address = data.address;
        companyForm.value.phoneNumber = data.phoneNumber;
        companyForm.value.director = data.director;
        companyForm.value.regionId = data.regionId;
        companyForm.value.districtId = data.districtId;
        companyForm.value.stateId = data.stateId;
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
        queryClient.invalidateQueries({ queryKey: ["getByIdCompany", requestId] });
    }
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => adminDeleteWithId("organization", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["companies"] });
    }
});

const isOpenModal = (title, flag) => {
    titleModal.value = title;
    requestFlag.value = flag;
    toggleIsOpenModalForm();

    if (requestFlag.value === 'create' && isOpenModalForm.value) {
        companyForm.value = clearForm(companyForm.value);
        v$.value.$reset();
    }
}

const createNewCompanyHandler = () => {
    isOpenModal("addNewCompanyTitle", "create");
}

const editCompanyHandler = (idx) => {
    requestId.value = idx;
    isOpenModal("editCompanyTitle", "edit");
}

const deleteCompanyHandler = async (idx) => {
    mutateDelete(idx);
}

const submitFormHandler = async () => {
    v$.value.$validate();

    if (v$.value.$errors.length) {
        return;
    }

    if (requestFlag.value === 'create') {
        delete companyForm.value.id;
        delete companyForm.value.stateId;

        createMutate(companyForm.value);
    } else {
        updateMutate(companyForm.value);
    }

    toggleIsOpenModalForm();
    companyForm.value = clearForm(companyForm.value);
    v$.value.$reset();
}
</script>

<style lang="scss" scoped>
.company {
    &__inner {
        padding: 20px;
    }

    &__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;

        @media (max-width: 1024px) {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 768px) {
            gap: 15px;
        }

        @media (max-width: 480px) {
            grid-template-columns: repeat(1, 1fr);
        }
    }
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
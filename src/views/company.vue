<template>
    <section class="company">
        <div class="company__inner">
            <div class="company__head">
                <Title>
                    {{ $t("comapnyTitle") }}
                </Title>
                <FormSearch @onSearch="searchHandler" />
                <AddButton
                    @onOpenFormModal="createNewCompanyHandler"
                />
            </div>
            <!-- <Table 
                v-if="isSuccessGetListCompany && getListCompany.length"
                :headers="headers" 
                :table="getListCompany" 
                @onActionEdit="editCompanyHandler"
                @onActionDelete="deleteCompanyHandler"
            /> -->
            <!-- <Spinner v-if="isLoadingGetListCompany" /> -->
            <!-- <div v-if="!getListCompany.length" class="empty-table">
                {{ $t("emptyTableTitle") }}
            </div> -->
        </div>
        <FormModal :title="titleModal">
            <form class="company__form" @submit.prevent="submitFormHandler">
                <FormInput 
                    v-for="input in inputs"
                    :key="input.id"
                    :width="500" 
                    :placeholder="$t(input.placeholder)"
                    :name="input.icon"
                    v-model="companyForm[input.model]"
                    :error="v$?.[input.errorKey].$error" 
                    :textError="v$?.[input.errorKey].$errors[0]?.$message"
                >
                    {{ $t(input.label) }}
                </FormInput>
                <FormSelect 
                    v-for="select in selects"
                    :key="select.id"
                    :width="500" 
                    v-model="companyForm[select.model]" 
                    :options="select.options"
                    :error="v$?.[select.errorKey].$error" 
                    :textError="v$?.[select.errorKey].$errors[0]?.$message"
                >
                    {{ $t(select.label) }}
                </FormSelect>
                <CustomButton 
                    :className="`form__submit ${v$?.district.$errors[0]?.$message ? 'centered' : ''}`"
                >
                    {{ $t("formButton") }}
                </CustomButton>
            </form>
        </FormModal>
    </section>
</template>

<script setup>
import { ref, computed } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@/utils/i18n-validators.js";
import { useQuery, useMutation } from "@tanstack/vue-query";
import { useToast } from "vue-toastification";
import { useModalsStore } from "@/store/modalsStore.js";
import { useI18n } from "vue-i18n";
import { 
    adminGetList, 
    adminGetWithId, 
    adminCreate, 
    adminUpdateWithId, 
    adminDeleteWithId 
} from "@/services/superadmin_crud.services.js";
import Title from "@/components/Title.vue";
import FormSearch from "@/components/FormSearch.vue";
import AddButton from "@/components/AddButton.vue";
import Table from "@/components/Table.vue";
import FormModal from "@/components/FormModal.vue";
import FormInput from "@/components/FormInput.vue";
import FormSelect from "@/components/FormSelect.vue";
import CustomButton from "@/components/CustomButton.vue";
import Spinner from "@/components/Spinner.vue";

const toast = useToast();
const { t } = useI18n();

const modalsStore = useModalsStore();
const { toggleIsOpenModalForm } = modalsStore;

const titleModal = ref("");
const requestFlag = ref("");
const requestId = ref("");

const companyForm = ref({
    name: "",
    tin: "",
    address: "",
    phone: "",
    director: "",
    region: "",
    district: ""
});

const rules = computed(() => ({
    name: { required },
    tin: { required },
    address: { required },
    phone: { required },
    director: { required },
    region: { required },
    district: { required },
}));

const headers = ref([
    { id: 1, label: "organizationName", width: 260 },
    { id: 2, label: "organizationInn", width: 125 },
    { id: 3, label: "organizationRegion", width: 225 },
    { id: 4, label: "organizationDistrict", width: 110 },
    { id: 5, label: "organizationAddress", width: 220 },
    { id: 6, label: "organizationPhone", width: 175 },
    { id: 7, label: "organizationDirector", width: 265 },
    { id: 8, label: "organizationAction", width: 135 },
]);

// const table = ref([
//     { 
//         id: 1, 
//         organizationName: "Microsoft Academy", 
//         Inn: "123456789", 
//         region: "Навоиская область", 
//         district: "Навои", 
//         address: "Ибн-Сино 18", 
//         phone: "+998999999999", 
//         director: "Иванов Иван Иванович" 
//     },
//     { 
//         id: 2, 
//         organizationName: "Admin qwerty company", 
//         Inn: "123456789", 
//         region: "Навоиская область", 
//         district: "Навои", 
//         address: "Толстово кирпич 18", 
//         phone: "+998999999999", 
//         director: "Иванов Иван Иванович" 
//     },
//     { 
//         id: 3, 
//         organizationName: "Microsoft Academy", 
//         Inn: "123456789", 
//         region: "Навоиская область", 
//         district: "Навои", 
//         address: "Ибн-Сино 18", 
//         phone: "+998999999999", 
//         director: "Иванов Иван Иванович" 
//     },
//     { 
//         id: 4, 
//         organizationName: "Admin qwerty company wlefjl klsdfj jksdfj", 
//         Inn: "123456789", 
//         region: "Навоиская область", 
//         district: "Навои", 
//         address: "Толстово кирпич 18", 
//         phone: "+998999999999", 
//         director: "Иванов Иван Иванович" 
//     },
//     { 
//         id: 5, 
//         organizationName: "Microsoft Academy", 
//         Inn: "123456789", 
//         region: "Навоиская область", 
//         district: "Навои", 
//         address: "Ибн-Сино 18", 
//         phone: "+998999999999", 
//         director: "Иванов Иван Иванович" 
//     },
//     { 
//         id: 6, 
//         organizationName: "Admin qwerty company", 
//         Inn: "123456789", 
//         region: "Навоиская область", 
//         district: "Навои", 
//         address: "Толстово кирпич 18", 
//         phone: "+998999999999", 
//         director: "Иванов Иван Иванович" 
//     }
// ]);

const inputs = ref([
    { 
        id: 1, 
        model: "name", 
        label: "nameOrganizationLabel", 
        placeholder: "nameOrganizationPlaceholder", 
        icon: "input-company",
        errorKey: "name" 
    },
    { 
        id: 2, 
        model: "tin", 
        label: "innOrganizationLabel", 
        placeholder: "innOrganizationPlaceholder", 
        icon: "tin",
        errorKey: "tin" 
    },
    { 
        id: 3, 
        model: "address", 
        label: "addressOrganizationLabel", 
        placeholder: "addressOrganizationPlaceholder", 
        icon: "address",
        errorKey: "address" 
    },
    { 
        id: 4, 
        model: "phone", 
        label: "phoneOrganizationLabel", 
        placeholder: "phoneOrganizationPlaceholder", 
        icon: "phone",
        errorKey: "phone" 
    },
    { 
        id: 5, 
        model: "director", 
        label: "directorOrganizationLabel", 
        placeholder: "directorOrganizationPlaceholder", 
        icon: "person",
        errorKey: "director" 
    }
]);

const regionSelect = ref([
    { id: 1, option: "Навои обл." },
    { id: 2, option: "Самарканд обл." },
    { id: 3, option: "Ташкент обл." }
]);

const discrictSelect = ref([
    { id: 1, option: "Навои" },
    { id: 2, option: "Самарканд" },
    { id: 3, option: "Ташкент" }
]);

const selects = ref([
    { 
        id: 1, 
        model: "region", 
        label: "regionOrganizationLabel", 
        options: regionSelect,
        errorKey: "region" 
    },
    { 
        id: 2, 
        model: "district", 
        label: "districtOrganizationLabel", 
        options: discrictSelect,
        errorKey: "district" 
    }
]);

const v$ = useVuelidate(rules, companyForm);

// const {
//     data: getListCompany,
//     isLoading: isLoadingGetListCompany,
//     isSuccess: isSuccessGetListCompany
// } = await useQuery({
//     queryKey: ["getListCompany"],
//     queryFn: () => adminGetList("organization")
// });

// const {
//     data: getCompanyId,
//     isLoading: isLoadingGetCompanyId,
//     isSuccess: isSuccessGetCompanyId,
//     refetch 
// } = await useQuery({
//     queryKey: ["getByIdCompany", requestId],
//     queryFn: () => adminGetWithId("organization", requestId.value),
//     enabled: false
// });

// const { mutate: createMutate } = useMutation({
//     mutationFn: (body) => adminCreate("organization", body)
// });

// const { mutate: updateMutate } = useMutation({
//     mutationFn: (body) => adminUpdateWithId("organization", body)
// });

// const { mutate: deleteMutate } = useMutation({
//     mutationFn: (idx) => adminDeleteWithId("organization", idx)
// });

const searchHandler = (search) => {
    console.log(search);
}

const createNewCompanyHandler = () => {
    titleModal.value = "addNewCompanyTitle";
    requestFlag.value = "create";
    toggleIsOpenModalForm();
}

const editCompanyHandler = (idx) => {
    titleModal.value = "editCompanyTitle";
    requestFlag.value = "edit";
    requestId.value = idx;
    toggleIsOpenModalForm();
    // refetch();
}

const deleteCompanyHandler = (idx) => {
    // deleteMutate(idx);
    toast.success(t("deleteCompanyToast"));
}

const submitFormHandler = () => {
    v$.value.$validate();

    if (!v$.value.$errors.length) {
        if (requestFlag.value === 'create') {
            console.log('create');
            // createMutate(companyForm.value);
            toast.success(t("updateCompanyToast"));
        } else {
            console.log('update');
            // updateMutate(companyForm.value);
            toast.success(t("createCompanyToast"));
        }

        toggleIsOpenModalForm();
    }

    console.log('invalid');
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
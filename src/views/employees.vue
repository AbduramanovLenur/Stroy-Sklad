<template>
    <section class="employees">
        <div class="employees__inner">
            <div class="employees__head">
                <Title>
                    {{ $t("employeesTitle") }}
                </Title>
                <FormSearch @onSearch="searchHandler" />
                <AddButton
                    @onOpenFormModal="createNewEmployeesHandler"
                />
            </div>
            <Table 
                :headers="headers" 
                :table="table" 
                @onActionEdit="editEmployeesHandler"
                @onActionDelete="deleteEmployeesHandler"
            />
        </div>
        <FormModal :title="titleModal">
            <form class="employees__form" @submit.prevent="submitFormHandler">
                <FormInput 
                    v-for="input in inputs"
                    :key="input.id"
                    :width="500" 
                    :placeholder="$t(input.placeholder)"
                    :name="input.icon"
                    v-model="employeesForm[input.model]"
                    :error="v$?.[input.errorKey].$error" 
                    :textError="v$?.[input.errorKey].$errors[0]?.$message"
                >
                    {{ $t(input.label) }}
                </FormInput>
                <FormSelect 
                    v-for="select in selects"
                    :key="select.id"
                    :width="500" 
                    v-model="employeesForm[select.model]" 
                    :options="select.options"
                    :error="v$?.[select.errorKey].$error" 
                    :textError="v$?.[select.errorKey].$errors[0]?.$message"
                >
                    {{ $t(select.label) }}
                </FormSelect>
                <CustomButton 
                    :className="`form__submit ${v$?.role.$errors[0]?.$message ? 'centered' : ''}`"
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
import { useModalsStore } from "@/store/modalsStore.js";
import Title from "@/components/Title.vue";
import FormSearch from "@/components/FormSearch.vue";
import AddButton from "@/components/AddButton.vue";
import Table from "@/components/Table.vue";
import FormModal from "@/components/FormModal.vue";
import FormInput from "@/components/FormInput.vue";
import FormSelect from "@/components/FormSelect.vue";
import CustomButton from "@/components/CustomButton.vue";

const modalsStore = useModalsStore();
const { toggleIsOpenModalForm } = modalsStore;

const titleModal = ref("");
const requestFlag = ref("");
const requestId = ref("");

const employeesForm = ref({
    fullName: "",
    login: "",
    password: "",
    phone: "",
    organization: "",
    role: "",
});

const rules = computed(() => ({
    fullName: { required },
    login: { required },
    password: { required },
    phone: { required },
    organization: { required },
    role: { required },
}));

const headers = ref([
    { id: 1, label: "employeesFullName", width: 300 },
    { id: 2, label: "employeesOrganization", width: 320 },
    { id: 3, label: "employeesPhone", width: 255 },
    { id: 4, label: "employeesRole", width: 195 },
    { id: 5, label: "employeesState", width: 250 },
    { id: 8, label: "employeesAction", width: 190 },
]);

const table = ref([
    { 
        id: 1, 
        fullName: "Иванов Иван Иванович", 
        organization: "Microsoft Academy", 
        phoneEmployees: "+998999999999", 
        role: "Начальник", 
        status: "Неактивный",
    },
    { 
        id: 2, 
        fullName: "Иванов Иван Иванович", 
        organization: "Microsoft Academy", 
        phoneEmployees: "+998999999999", 
        role: "Начальник", 
        status: "Активный",
    },
    { 
        id: 3, 
        fullName: "Иванов Иван Иванович", 
        organization: "Microsoft Academy", 
        phoneEmployees: "+998999999999", 
        role: "Начальник", 
        status: "Активный",
    },
    { 
        id: 4, 
        fullName: "Иванов Иван Иванович", 
        organization: "Microsoft Academy", 
        phoneEmployees: "+998999999999", 
        role: "Начальник", 
        status: "Неактивный",
    },
    { 
        id: 5, 
        fullName: "Иванов Иван Иванович", 
        organization: "Microsoft Academy", 
        phoneEmployees: "+998999999999", 
        role: "Начальник", 
        status: "Активный",
    },
    { 
        id: 6, 
        fullName: "Иванов Иван Иванович", 
        organization: "Microsoft Academy", 
        phoneEmployees: "+998999999999", 
        role: "Начальник", 
        status: "Неактивный",
    }
]);

const inputs = ref([
    { 
        id: 1, 
        model: "fullName", 
        label: "employeesFullNameLabel", 
        placeholder: "employeesFullNamePlaceholder", 
        icon: "person", 
        errorKey: "fullName" 
    },
    { 
        id: 2, 
        model: "login", 
        label: "employeesLoginLabel", 
        placeholder: "employeesLoginPlaceholder", 
        icon: "login", 
        errorKey: "login" 
    },
    { 
        id: 3, 
        model: "password", 
        label: "employeesPasswordLabel", 
        placeholder: "employeesPasswordPlaceholder", 
        icon: "password", 
        errorKey: "password" 
    },
    { 
        id: 4, 
        model: "phone", 
        label: "employeesPhoneLabel",
        placeholder: "employeesPhonePlaceholder", 
        icon: "phone", 
        errorKey: "phone" 
    }
]);

const organizationRole = ref([
    { id: 1, option: "Навои обл." },
    { id: 2, option: "Самарканд обл." },
    { id: 3, option: "Ташкент обл." }
]);

const roleSelect = ref([
    { id: 1, option: "Навои" },
    { id: 2, option: "Самарканд" },
    { id: 3, option: "Ташкент" }
]);

const selects = ref([
    { 
        id: 1, 
        model: "organization", 
        label: "employeesOrganizationLabel", 
        options: organizationRole, 
        errorKey: "organization" 
    },
    { 
        id: 2, 
        model: "role", 
        label: "employeesRoleLabel", 
        options: roleSelect, 
        errorKey: "role" 
    }
]);

const v$ = useVuelidate(rules, employeesForm);

const searchHandler = (search) => {
    console.log(search);
}

const createNewEmployeesHandler = () => {
    titleModal.value = "addNewEmployeesTitle";
    requestFlag.value = "create";
    toggleIsOpenModalForm();
}

const editEmployeesHandler = (idx) => {
    titleModal.value = "editEmployeesTitle";
    requestFlag.value = "edit";
    requestId.value = idx;
    toggleIsOpenModalForm();
    console.log(idx);
}

const deleteEmployeesHandler = (idx) => {
    console.log(idx);
}

const submitFormHandler = () => {
    v$.value.$validate();

    if (!v$.value.$errors.length) {
        if (requestFlag.value === 'create') {
            console.log('create');
            return;
        }

        console.log('update');
    }

    console.log('invalid');
}
</script>

<style lang="scss" scoped>
.employees {
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
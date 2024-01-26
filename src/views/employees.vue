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
                v-if="isSuccessEmployees && employees.length"
                :headers="headers" 
                :table="employees" 
                @onActionEdit="editEmployeesHandler"
                @onActionDelete="deleteEmployeesHandler"
            />
            <Spinner v-if="isLoadingEmployees" />
            <div v-if="isSuccessEmployees && !employees.length" class="empty-table">
                {{ $t("emptyTableTitle") }}
            </div> 
        </div>
        <FormModal :title="titleModal">
            <form class="employees__form" @submit.prevent="submitFormHandler">
                <FormInput 
                    v-for="input in inputs"
                    :key="input.id"
                    v-model="employeesForm[input.model]"
                    :width="500" 
                    :placeholder="$t(input.placeholder)"
                    :name="input.icon"
                    :error="v$?.[input?.errorKey]?.$error" 
                    :textError="v$?.[input?.errorKey]?.$errors[0]?.$message"
                    :show="input.show"
                    :requestFlag="requestFlag"
                >
                    {{ $t(input.label) }}
                </FormInput>
                <FormSelect 
                    v-for="select in selects"
                    :key="select.id"
                    v-model="employeesForm[select.model]" 
                    :width="500" 
                    :options="select.options"
                    :error="v$?.[select?.errorKey]?.$error" 
                    :textError="v$?.[select?.errorKey]?.$errors[0]?.$message"
                    :success="select.success"
                    :loading="select.loading"
                    :show="select.show"
                    :requestFlag="requestFlag"
                >
                    {{ $t(select.label) }}
                </FormSelect>
                <CustomButton 
                    :className="`form__submit ${v$?.roleId.$errors[0]?.$message ? 'centered' : ''}`"
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
import { required, minLength } from "@/utils/i18n-validators.js";
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
    manualGetOrganizations,
    manualGetRoles,
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

const titleModal = ref("");
const requestFlag = ref("");
const requestId = ref("");

const {
    data: organizations,
    isSuccess: isSuccessOrganizations,
    isLoading: isLoadingOrganizations,
    refetch: refetchOrganizations
} = await useQuery({
    queryKey: ["organizations"],
    queryFn: () => manualGetOrganizations(),
    enabled: false
});

const {
    data: roles,
    isSuccess: isSuccessRoles,
    isLoading: isLoadingRoles,
    refetch: refetchRoles
} = await useQuery({
    queryKey: ["districts"],
    queryFn: () => manualGetRoles(),
    enabled: false
});

const {
    data: states,
    isSuccess: isSuccessStates,
    isLoading: isLoadingStates,
    refetch: refetchStates
} = await useQuery({
    queryKey: ["statesEmployees"],
    queryFn: () => manualGetStates(),
    enabled: false
});

const employeesForm = ref({
    id: "",
    fullName: "",
    userName: "",
    password: "",
    phoneNumber: "",
    organizationId: "",
    roleId: "",
    stateId: ""
});

const rules = computed(() => {
    switch (requestFlag.value) {
        case "edit": {
            return {
                fullName: { required },
                userName: { required },
                phoneNumber: { required },
                organizationId: { required },
                roleId: { required },
            }

            break;
        }
        default: {
            return {
                fullName: { required },
                userName: { required },
                password: { required, minLength },
                phoneNumber: { required },
                organizationId: { required },
                roleId: { required },
            }
        }
    }
});

const headers = ref([
    { id: 1, label: "employeesFullName", width: 300 },
    { id: 2, label: "employeesOrganization", width: 320 },
    { id: 3, label: "employeesPhone", width: 255 },
    { id: 4, label: "employeesRole", width: 195 },
    { id: 5, label: "employeesState", width: 250 },
    { id: 8, label: "employeesAction", width: 190 },
]);

const inputs = ref([
    { 
        id: 1, 
        model: "fullName", 
        label: "employeesFullNameLabel", 
        placeholder: "employeesFullNamePlaceholder", 
        icon: "person", 
        errorKey: "fullName",
        show: ["create", "edit"]
    },
    { 
        id: 2, 
        model: "userName", 
        label: "employeesLoginLabel", 
        placeholder: "employeesLoginPlaceholder", 
        icon: "login", 
        errorKey: "userName",
        show: ["create", "edit"]
    },
    { 
        id: 3, 
        model: "password", 
        label: "employeesPasswordLabel", 
        placeholder: "employeesPasswordPlaceholder", 
        icon: "password", 
        errorKey: "password",
        show: ["create"]
    },
    { 
        id: 4, 
        model: "phoneNumber", 
        label: "employeesPhoneLabel",
        placeholder: "employeesPhonePlaceholder", 
        icon: "phone", 
        errorKey: "phoneNumber",
        show: ["create", "edit"]
    }
]);

const selects = ref([
    { 
        id: 1, 
        model: "organizationId", 
        label: "employeesOrganizationLabel", 
        options: organizations, 
        errorKey: "organizationId",
        success: isSuccessOrganizations,
        loading: isLoadingOrganizations,
        show: ["create", "edit"]
    },
    { 
        id: 2, 
        model: "roleId", 
        label: "employeesRoleLabel", 
        options: roles, 
        errorKey: "roleId", 
        success: isSuccessRoles,
        loading: isLoadingRoles,
        show: ["create", "edit"]
    },
    { 
        id: 3, 
        model: "stateId", 
        label: "stateOrganizationLabel", 
        options: states,
        success: isSuccessStates,
        loading: isLoadingStates,
        show: ["edit"]
    }
]);

const v$ = useVuelidate(rules, employeesForm);

const {
    data: employees,
    isLoading: isLoadingEmployees,
    isSuccess: isSuccessEmployees
} = await useQuery({
    queryKey: ["employees"],
    queryFn: () => adminGetList("user"),
    select: (data) => {
        return data.map((elem) => {
            const employee = {
                ...elem,
                phone: elem.phoneNumber,
                company: elem.organizationName
            }

            delete employee.phoneNumber;
            delete employee.organizationName;

            return employee;
        })
    }
});

const {
    refetch: refetchEmployeesById
} = await useQuery({
    queryKey: ["employeesById", requestId],
    queryFn: () => adminGetWithId("user", requestId.value),
    select: (data) => {
        employeesForm.value.id = data.id;
        employeesForm.value.fullName = data.fullname;
        employeesForm.value.userName = data.userName;
        employeesForm.value.phoneNumber = data.phoneNumber;
        employeesForm.value.organizationId = data.organizationId;
        employeesForm.value.roleId = data.roleId;
        employeesForm.value.stateId = data.stateId;
    },
    enabled: false
});

const { mutate: createMutate } = useMutation({
    mutationFn: (body) => adminCreate("user", body),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["employees"] });
    }
});

const { mutate: updateMutate } = useMutation({
    mutationFn: (body) => adminUpdateById("user", body),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["employees"] });
        queryClient.invalidateQueries({ queryKey: ["getByIdEmployees", requestId] });
    }
});

const { mutate: deleteMutate } = useMutation({
    mutationFn: (idx) => adminDeleteWithId("user", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["employees"] });
    }
});

const searchHandler = (search) => {
    console.log(search);
}

const isOpenFormModal = (title, flag) => {
    titleModal.value = title;
    requestFlag.value = flag;
    refetchOrganizations();
    refetchRoles();
    toggleIsOpenModalForm();
}

const createNewEmployeesHandler = () => {
    isOpenFormModal("addNewEmployeesTitle", "create");
}

const editEmployeesHandler = (idx) => {
    requestId.value = idx;
    refetchEmployeesById();
    refetchStates();
    isOpenFormModal("editEmployeesTitle", "edit");
}

const deleteEmployeesHandler = (idx) => {
    deleteMutate(idx);
}

const submitFormHandler = () => {
    v$.value.$validate();

    if (v$.value.$errors.length) {
        return;
    }

    if (requestFlag.value === 'create') {
        delete employeesForm.value.id;
        delete employeesForm.value.stateId;

        createMutate(employeesForm.value);
    } else {
        updateMutate(employeesForm.value);
    }

    toggleIsOpenModalForm();
    employeesForm.value = clearForm(employeesForm.value);
    v$.value.$reset();
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
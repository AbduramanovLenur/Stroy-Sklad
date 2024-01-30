<template>
    <section class="employees">
        <div class="employees__inner section-padding">
            <HeadPage
                title="employeesTitle" 
                @onSearch="($event) => employeesForm.search = $event"
                @onOpenFormModal="() => employeesHandler('create')"
            />
            <Table 
                v-if="isSuccessEmployees && employees.length"
                :headers="headers" 
                :table="employees" 
                @onActionEdit="($event) => employeesHandler('edit', $event)"
                @onActionDelete="deleteEmployeesHandler"
            />
            <Spinner 
                v-if="isLoadingEmployees" 
            />
            <div 
                v-if="(isSuccessEmployees && !employees.length) || isError" 
                class="empty-table"
            >
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
import { storeToRefs } from "pinia";
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


const queryClient = useQueryClient();

const modalsStore = useModalsStore();
const { toggleIsOpenModalForm } = modalsStore;
const { isOpenModalForm } = storeToRefs(modalsStore);

const titleModal = ref("addNewEmployeesTitle");
const requestFlag = ref("");
const requestId = ref("");

const employeesForm = ref({
    id: "",
    fullName: "",
    userName: "",
    password: "",
    phoneNumber: "",
    organizationId: "",
    roleId: "",
    stateId: "",
    search: ""
});

const isCreateForm = computed(() => isOpenModalForm);
const isEditForm = computed(() => isOpenModalForm && requestFlag.value == "edit");

const {
    data: organizations,
    isSuccess: isSuccessOrganizations,
    isLoading: isLoadingOrganizations
} = await useQuery({
    queryKey: ["organizations"],
    queryFn: () => manualGetOrganizations(),
    enabled: isCreateForm
});

const {
    data: roles,
    isSuccess: isSuccessRoles,
    isLoading: isLoadingRoles
} = await useQuery({
    queryKey: ["roles"],
    queryFn: () => manualGetRoles(),
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
    },
    { 
        id: 2, 
        model: "userName", 
        label: "employeesLoginLabel", 
        placeholder: "employeesLoginPlaceholder", 
        icon: "login", 
        errorKey: "userName",
    },
    { 
        id: 3, 
        model: "password", 
        label: "employeesPasswordLabel", 
        placeholder: "employeesPasswordPlaceholder", 
        icon: "password", 
        errorKey: "password",
    },
    { 
        id: 4, 
        model: "phoneNumber", 
        label: "employeesPhoneLabel",
        placeholder: "employeesPhonePlaceholder", 
        icon: "phone", 
        errorKey: "phoneNumber",
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
    isSuccess: isSuccessEmployees,
    isError
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

const {} = await useQuery({
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
    enabled: isEditForm
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
        queryClient.invalidateQueries({ queryKey: ["employeesById", requestId] });
    }
});

const { mutate: deleteMutate } = useMutation({
    mutationFn: (idx) => adminDeleteWithId("user", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["employees"] });
        queryClient.invalidateQueries({ queryKey: ["employeesById", requestId] });
    }
});

const isOpenFormModal = (title, flag) => {
    titleModal.value = title;
    requestFlag.value = flag;
    toggleIsOpenModalForm();

    if (requestFlag.value === "create" && isOpenModalForm.value) {
        employeesForm.value = clearForm(employeesForm.value);
        v$.value.$reset();
    }
}

const employeesHandler = (flag, idx) => {
    if (flag === "edit" && idx) {
        requestId.value = idx;
        isOpenFormModal("editEmployeesTitle", "edit");
        return;
    }

    isOpenFormModal("addNewEmployeesTitle", "create");
}

const deleteEmployeesHandler = (idx) => {
    deleteMutate(idx);
}

const submitFormHandler = () => {
    v$.value.$validate();

    if (v$.value.$errors.length) {
        return;
    }

    if (requestFlag.value === "create") {
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
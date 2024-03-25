<template>
    <section class="manage section-height shadowed">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="editEmployeesTitle" 
                :to="routes.EMPLOYEES.path"
            />
            <form class="manage__form form-manage" @submit.prevent="submitHandler">
                <FormInput 
                    v-for="input in inputs"
                    :key="input.id"
                    v-model="state[input.model]"
                    :width="500" 
                    :placeholder="$t(input.placeholder)"
                    :name="input.icon"
                    :error="v$?.[input?.errorKey]?.$error" 
                    :type="input?.type"
                    :textError="v$?.[input?.errorKey]?.$errors[0]?.$message"
                >
                    {{ $t(input.label) }}
                </FormInput>
                <FormInput 
                    v-model="state.createRoleDto.fullName"
                    :width="500" 
                    :placeholder="$t('employeesRolePlaceholder')"
                    name="person"
                    :error="v$?.createRoleDto.fullName?.$error"
                    :textError="v$?.createRoleDto.fullName?.$errors[0]?.$message"
                >
                    {{ $t('employeesRoleLabel') }}
                </FormInput>
                <FormSelect 
                    v-for="select in selects"
                    :key="select.id"
                    v-model.trim="state[select.model]" 
                    :width="500" 
                    :options="select.options"
                    :error="v$?.[select?.errorKey]?.$error" 
                    :placeholder="select?.placeholder"
                    :textError="v$?.[select?.errorKey]?.$errors[0]?.$message"
                    :success="select.success"
                    :loading="select.loading"
                >
                    {{ $t(select.label) }}
                </FormSelect>
                <ActionsModules 
                    v-if="isSuccessModules"
                    v-model="state.updateRoleDto.roleModules"
                    :actions="modules"
                />
                <CustomButton 
                    v-if="isSuccessModules"
                    :className="`form__submit ${v$?.stateId.$errors[0]?.$message ? 'centered' : ''}`"
                >
                    {{ $t("formButton") }}
                </CustomButton>
                <Spinner v-if="isLoadingModules" />
            </form>
        </div>
    </section>
</template>

<script setup>
import { getWithId, updateById } from "@/services/crud.services.js"
import {
manualGetModules,
manualGetOrganizations,
manualGetStates
} from "@/services/manual.services.js"
import { required } from "@/utils/i18n-validators.js"
import { routes } from "@/utils/routes.js"
import { clearState } from "@/utils/secondary-functions.js"
import {
useMutation,
useQuery,
useQueryClient
} from "@tanstack/vue-query"
import { useVuelidate } from "@vuelidate/core"
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"
import { useToast } from "vue-toastification"

const queryClient = useQueryClient();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const { t } = useI18n();

const slugId = ref(route.params.id);

const state = ref({
    id: "",
    fullName: "",
    userName: "",
    password: "",
    phoneNumber: "",
    organizationId: [],
    updateRoleDto: {
        id: 0,
        stateId: 0,
        fullName: "OrgAdmin",
        shortName: "OrgAdmin",
        roleModules: []
    },
    stateId: []
});

const rules = computed(() => ({
    id: { required },
    fullName: { required },
    userName: { required },
    phoneNumber: { required },
    organizationId: { required },
    updateRoleDto: { 
        id: { required },
        stateId: { required },
        fullName: { required }, 
        shortName: { required }, 
        roleModules: { required } 
    },
    stateId: { required }
}));

const v$ = useVuelidate(rules, state);

const {
    data: organizations,
    isSuccess: isSuccessOrganizations,
    isLoading: isLoadingOrganizations
} = await useQuery({
    queryKey: ["organizations"],
    queryFn: () => manualGetOrganizations()
});

const {
    data: states,
    isSuccess: isSuccessStates,
    isLoading: isLoadingStates
} = await useQuery({
    queryKey: ["states"],
    queryFn: () => manualGetStates()
});

const {
    data: modules,
    isLoading: isLoadingModules,
    isSuccess: isSuccessModules
} = await useQuery({
    queryKey: ["modules"],
    queryFn: () => manualGetModules()
});

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
    },
    { 
        id: 4, 
        model: "phoneNumber", 
        label: "employeesPhoneLabel",
        placeholder: "employeesPhonePlaceholder", 
        icon: "phone", 
        errorKey: "phoneNumber",
        type: "number"
    }
]);

const selects = ref([
    { 
        id: 1, 
        model: "organizationId", 
        label: "employeesOrganizationLabel", 
        placeholder: "employeesOrganizationPlaceholder", 
        errorKey: "organizationId",
        options: organizations, 
        success: isSuccessOrganizations,
        loading: isLoadingOrganizations
    },
    { 
        id: 2, 
        model: "stateId", 
        label: "employeesStatePlaceholder", 
        placeholder: "employeesStatePlaceholder", 
        errorKey: "stateId", 
        options: states,
        success: isSuccessStates,
        loading: isLoadingStates
    }
]);

const { isError } = await useQuery({
    queryKey: ["employeeById", slugId],
    queryFn: () => getWithId("user", slugId.value),
    select: (data) => {
        state.value.id = data.id;
        state.value.fullName = data.fullName;
        state.value.userName = data.userName;
        state.value.phoneNumber = data.phoneNumber;
        state.value.organizationId = [data.organizationId];
        state.value.stateId = [data.stateId];
        state.value.updateRoleDto.id = data.updateRoleDto.id;
        state.value.updateRoleDto.stateId = data.updateRoleDto.stateId;
        state.value.updateRoleDto.shortName = data.updateRoleDto.shortName;
        state.value.updateRoleDto.fullName = data.updateRoleDto.fullName;
        state.value.updateRoleDto.roleModules = [...data.updateRoleDto.roleModules];
    }
});

watch(isError, (value) => {
    if (value) {
        router.push(routes.HOME.path);
    }
});

const { mutate: updateMutate } = useMutation({
    onMutate: (body) => {
        body.organizationId = body.organizationId[0];
        body.stateId = body.stateId[0];
    },
    mutationFn: (body) => updateById("user", body),
    onSuccess: (response) => {
        if (!response?.success) return;

        state.value = clearState(state.value);

        queryClient.invalidateQueries({ queryKey: ["employees"] });
        queryClient.invalidateQueries({ queryKey: ["employeeById", slugId] });

        router.push(routes.EMPLOYEES.path);

        setTimeout(() => toast.success(t("updateToast")), 150);
    }
});

const submitHandler = async () => {
    state.value.updateRoleDto.shortName = state.value.updateRoleDto.fullName;

    v$.value.$validate();

    if (v$.value.$errors.length) {
        return;
    }

    const formData = { ...state.value };

    updateMutate(formData);
    
    v$.value.$reset();
}
</script>

<style lang="scss" scoped>

</style>
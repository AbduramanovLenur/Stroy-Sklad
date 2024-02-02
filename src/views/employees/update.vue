<template>
    <section class="manage section-height">
        <div class="manage__inner section-padding">
            <Title>
                {{ $t("editEmployeesTitle") }}
            </Title>
            <form class="manage__form form-manage" @submit.prevent="submitHandler">
                <FormInput 
                    v-for="input in inputs"
                    :key="input.id"
                    v-model="state[input.model]"
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
                    v-model="state[select.model]" 
                    :width="500" 
                    :options="select.options"
                    :error="v$?.[select?.errorKey]?.$error" 
                    :textError="v$?.[select?.errorKey]?.$errors[0]?.$message"
                    :success="select.success"
                    :loading="select.loading"
                >
                    {{ $t(select.label) }}
                </FormSelect>
                <CustomButton 
                    :className="`form__submit ${v$?.stateId.$errors[0]?.$message ? 'centered' : ''}`"
                >
                    {{ $t("formButton") }}
                </CustomButton>
            </form>
        </div>
    </section>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useVuelidate } from "@vuelidate/core";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { required } from "@/utils/i18n-validators.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/vue-query";
import { getWithId, updateById } from "@/services/crud.services.js";
import { manualGetOrganizations, manualGetRoles, manualGetStates } from "@/services/manual.services.js";
import { routes } from "@/utils/routes.js";

const queryClient = useQueryClient();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const { t } = useI18n();

const slugId = ref(route.params.id);

const {
    data: organizations,
    isSuccess: isSuccessOrganizations,
    isLoading: isLoadingOrganizations
} = await useQuery({
    queryKey: ["organizations"],
    queryFn: () => manualGetOrganizations()
});

const {
    data: roles,
    isSuccess: isSuccessRoles,
    isLoading: isLoadingRoles
} = await useQuery({
    queryKey: ["roles"],
    queryFn: () => manualGetRoles()
});

const {
    data: states,
    isSuccess: isSuccessStates,
    isLoading: isLoadingStates
} = await useQuery({
    queryKey: ["states"],
    queryFn: () => manualGetStates()
});

const state = ref({
    id: "",
    fullName: "",
    userName: "",
    password: "",
    phoneNumber: "",
    organizationId: "",
    roleId: "",
    stateId: ""
});

const rules = computed(() => ({
    id: { required },
    fullName: { required },
    userName: { required },
    phoneNumber: { required },
    organizationId: { required },
    roleId: { required },
    stateId: { required }
}));

const v$ = useVuelidate(rules, state);

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
        loading: isLoadingOrganizations
    },
    { 
        id: 2, 
        model: "roleId", 
        label: "employeesRoleLabel", 
        options: roles, 
        errorKey: "roleId", 
        success: isSuccessRoles,
        loading: isLoadingRoles
    },
    { 
        id: 3, 
        model: "stateId", 
        label: "employeesStateLabel", 
        options: states,
        success: isSuccessStates,
        loading: isLoadingStates
    }
]);

const { isError } = await useQuery({
    queryKey: ["employeesById", slugId],
    queryFn: () => getWithId("user", slugId.value),
    select: (data) => {
        state.value.id = data.id;
        state.value.fullName = data.fullname;
        state.value.userName = data.userName;
        state.value.phoneNumber = data.phoneNumber;
        state.value.organizationId = data.organizationId;
        state.value.roleId = data.roleId;
        state.value.stateId = data.stateId;
    }
});

watch(isError, (value) => {
    if (value) {
        router.push(routes.HOME.path);
    }
});

const { mutate: updateMutate } = useMutation({
    mutationFn: (body) => updateById("user", body),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["employees"] });
        queryClient.invalidateQueries({ queryKey: ["employeesById", slugId] });
        router.push(routes.EMPLOYEES.path);
    }
});

const submitHandler = async () => {
    v$.value.$validate();

    if (v$.value.$errors.length) {
        return;
    }

    updateMutate(state.value);
    v$.value.$reset();
}
</script>

<style lang="scss" scoped>

</style>
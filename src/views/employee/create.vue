<template>
    <section class="manage section-height shadowed">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="addNewEmployeesTitle" 
                :to="routes.EMPLOYEES.path"
            />
            <form class="manage__form form-manage" @submit.prevent="submitHandler">
                <template v-for="field in fields" :key="field.id">
                    <FormInput 
                        v-if="!field?.select && field.model !== 'createRoleDto.fullName'"
                        v-model="state[field.model]"
                        :width="500" 
                        :placeholder="$t(field.placeholder)"
                        :name="field.icon"
                        :error="v$?.[field.errorKey]?.$error" 
                        :type="field?.type"
                        :textError="v$?.[field.errorKey]?.$errors[0]?.$message"
                    >
                        {{ $t(field.label) }}
                    </FormInput>
                    <FormInput 
                        v-if="!field?.select && field.model === 'createRoleDto.fullName'"
                        v-model="state.createRoleDto.fullName"
                        :width="500" 
                        :placeholder="$t('employeesRolePlaceholder')"
                        name="person"
                        :error="v$?.createRoleDto?.fullName?.$error"
                        :textError="v$?.createRoleDto?.fullName?.$errors[0]?.$message"
                    >
                        {{ $t('employeesRoleLabel') }}
                    </FormInput>
                    <FormSelect 
                        v-if="field?.select"
                        v-model.trim="state[field.model]" 
                        :width="500" 
                        :options="field.options"
                        :error="v$?.[field?.errorKey]?.$error" 
                        :placeholder="field?.placeholder"
                        :textError="v$?.[field?.errorKey]?.$errors[0]?.$message"
                        :success="field.success"
                        :loading="field.loading"
                    >
                        {{ $t(field.label) }}
                    </FormSelect>
                </template>
                <ActionsModules 
                    v-if="isSuccessModules"
                    v-model="state.createRoleDto.roleModules"
                    :actions="modules"
                />
                <CustomButton 
                    v-if="isSuccessModules"
                    className="form__submit"
                    :disabled="status === 'pending'"
                >
                    {{ $t("formButton") }}
                </CustomButton>
            </form>
            <Spinner v-if="isLoadingModules" />
        </div>
    </section>
</template>

<script setup>
import { create } from "@/services/crud.services.js"
import {
manualGetModules,
manualGetOrganizations
} from "@/services/manual.services.js"
import { minLength, required } from "@/utils/i18n-validators.js"
import { routes } from "@/utils/routes.js"
import { clearState } from "@/utils/secondary-functions.js"
import {
    useMutation,
    useQuery,
    useQueryClient
} from "@tanstack/vue-query"
import { useVuelidate } from "@vuelidate/core"
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { useToast } from "vue-toastification"

const queryClient = useQueryClient();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const state = ref({
    fullName: "",
    userName: "",
    password: "",
    phoneNumber: "",
    organizationId: [],
    createRoleDto: {
        fullName: "OrgAdmin",
        shortName: "OrgAdmin",
        roleModules: [],
    }
});

const rules = computed(() => ({
    fullName: { required },
    userName: { required },
    password: { required, minLength },
    phoneNumber: { required },
    organizationId: { required },
    createRoleDto: { 
        fullName: { required }, 
        shortName: { required }, 
        roleModules: { required } 
    }
}));

const v$ = useVuelidate(rules, state);

const {
    data: modules,
    isLoading: isLoadingModules,
    isSuccess: isSuccessModules
} = await useQuery({
    queryKey: ["modules"],
    queryFn: () => manualGetModules()
});

const {
    data: organizations,
    isSuccess: isSuccessOrganizations,
    isLoading: isLoadingOrganizations
} = await useQuery({
    queryKey: ["organizations"],
    queryFn: () => manualGetOrganizations()
});

const fields = ref([
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
        type: "number"
    },
    { 
        id: 5, 
        model: "createRoleDto.fullName"
    },
    { 
        id: 6, 
        model: "organizationId", 
        label: "employeesOrganizationLabel", 
        placeholder: "employeesOrganizationPlaceholder", 
        errorKey: "organizationId",
        options: organizations, 
        success: isSuccessOrganizations,
        loading: isLoadingOrganizations,
        select: true
    }
]);

const { mutate: createMutate, status } = useMutation({
    onMutate: (body) => {
        body.organizationId = body.organizationId[0];
    },
    mutationFn: (body) => create("user", body),
    onSuccess: (response) => {
        if (!response?.success) return;

        state.value = clearState(state.value);

        queryClient.invalidateQueries({ queryKey: ["employees"] });
        
        router.push(routes.EMPLOYEES.path);

        setTimeout(() => toast.success(t("createToast")), 150);
    }
});

const submitHandler = () => {
    state.value.createRoleDto.shortName = state.value.createRoleDto.fullName;

    v$.value.$validate();

    if (v$.value.$errors.length) {
        return;
    }

    const formData = { ...state.value };

    createMutate(formData);

    v$.value.$reset();
}
</script>

<style lang="scss" scoped></style>
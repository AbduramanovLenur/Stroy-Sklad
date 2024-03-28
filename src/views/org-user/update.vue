<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="editEmployeesTitle" 
                :to="routes.ORG_USER.path"
            />
            <form class="manage__form form-manage" @submit.prevent="submitHandler">
                <template v-for="field in fields" :key="field.id">
                    <FormInput 
                        v-if="!field?.select"
                        v-model="state[field.model]"
                        :width="500" 
                        :placeholder="$t(field.placeholder)"
                        :name="field.icon"
                        :error="v$?.[field?.errorKey]?.$error" 
                        :type="field?.type"
                        :textError="v$?.[field?.errorKey]?.$errors[0]?.$message"
                    >
                        {{ $t(field.label) }}
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
                <CustomButton 
                    :className="`form__submit ${v$?.stateId.$errors[0]?.$message ? 'centered' : ''}`"
                    :disabled="status === 'pending'"
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
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/userStore";
import { useVuelidate } from "@vuelidate/core";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { required } from "@/utils/i18n-validators.js";
import { 
    useQueryClient, 
    useQuery, 
    useMutation 
} from "@tanstack/vue-query";
import { getWithId, updateById } from "@/services/crud.services.js";
import { manualGetRoles, manualGetStates } from "@/services/manual.services.js";
import { routes } from "@/utils/routes.js";
import { actionModules } from "@/utils/action-modules.js";
import { clearState } from "@/utils/secondary-functions.js";

const queryClient = useQueryClient();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const { t } = useI18n();

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShow = computed(() => !!user?.value.user?.modules?.includes(actionModules.ORG_USER.UPDATE));

const slugId = ref(route.params.id);

const state = ref({
    id: "",
    fullName: "",
    userName: "",
    password: "",
    phoneNumber: "",
    organizationId: "",
    roleId: [],
    stateId: []
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

const {
    data: roles,
    isSuccess: isSuccessRoles,
    isLoading: isLoadingRoles
} = await useQuery({
    queryKey: ["rolesList", { organizationId: state.value.organizationId }],
    queryFn: () => manualGetRoles(),
    enabled: isShow
});

const {
    data: states,
    isSuccess: isSuccessStates,
    isLoading: isLoadingStates
} = await useQuery({
    queryKey: ["states"],
    queryFn: () => manualGetStates(),
    enabled: isShow
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
        model: "roleId", 
        label: "employeesRoleLabel", 
        placeholder: "employeesRolePlaceholder", 
        errorKey: "roleId", 
        options: roles, 
        success: isSuccessRoles,
        loading: isLoadingRoles,
        select: true
    },
    { 
        id: 6, 
        model: "stateId", 
        label: "employeesStateLabel", 
        placeholder: "employeesStatePlaceholder", 
        errorKey: "stateId", 
        options: states,
        success: isSuccessStates,
        loading: isLoadingStates,
        select: true
    }
]);

const { isError } = await useQuery({
    queryKey: ["orgUserById", slugId],
    queryFn: () => getWithId("user", slugId.value),
    select: (data) => {
        state.value.id = data.id;
        state.value.fullName = data.fullName;
        state.value.userName = data.userName;
        state.value.phoneNumber = data.phoneNumber;
        state.value.organizationId = data.organizationId;
        state.value.roleId = [data.roleId];
        state.value.stateId = [data.stateId];
    },
    enabled: isShow
});

watch(isError, (value) => {
    if (value) {
        router.push(routes.ORG_USER.path);
    }
});

const { mutate: updateMutate, status } = useMutation({
    onMutate: (body) => {
        body.roleId = body.roleId[0];
        body.stateId = body.stateId[0];
    },
    mutationFn: (body) => updateById("user", body),
    onSuccess: (response) => {
        if (!response?.success) return;

        state.value = clearState(state.value);

        queryClient.invalidateQueries({ queryKey: ["orgUsers"] });
        queryClient.invalidateQueries({ queryKey: ["orgUserById", slugId] });

        router.push(routes.ORG_USER.path);

        setTimeout(() => toast.success(t("updateToast")), 150);
    }
});

const submitHandler = async () => {
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
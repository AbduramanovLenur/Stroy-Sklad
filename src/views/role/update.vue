<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="editRolesTitle" 
                :to="routes.ROLE.path"
            />
            <form class="manage__form form-manage" @submit.prevent="submitHandler">
                <template v-for="field in fields" :key="field.id">
                    <FormInput 
                        v-if="!field?.select"
                        v-model="state[field.model]"
                        :placeholder="$t(field.placeholder)"
                        :name="field.icon"
                        :error="v$?.[field.errorKey]?.$error" 
                        :textError="v$?.[field.errorKey]?.$errors[0]?.$message"
                    >
                        {{ $t(field.label) }}
                    </FormInput>
                    <FormSelect 
                        v-if="field?.select"
                        v-model.trim="state[field.model]" 
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
                    v-model="state.roleModules"
                    :actions="modules"
                />
                <CustomButton 
                    v-if="isSuccessModules"
                    :className="`form__submit manage__submit ${v$?.fullName.$errors[0]?.$message ? 'centered' : ''}`"
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
import { getWithId, updateById } from "@/services/crud.services.js"
import { manualGetModules, manualGetStates } from "@/services/manual.services.js"
import { useUserStore } from "@/store/userStore"
import { actionModules } from "@/utils/action-modules.js"
import { required } from "@/utils/i18n-validators.js"
import { routes } from "@/utils/routes.js"
import { clearState } from "@/utils/secondary-functions.js"
import {
useMutation,
useQuery,
useQueryClient
} from "@tanstack/vue-query"
import { useVuelidate } from "@vuelidate/core"
import { storeToRefs } from "pinia"
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"
import { useToast } from "vue-toastification"

const queryClient = useQueryClient();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const { t } = useI18n();

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShow = computed(() => !!user?.value.user?.modules?.includes(actionModules.ROLE.UPDATE));

const slugId = ref(route.params.id);

const state = ref({
    id: "",
    shortName: "",
    fullName: "",
    roleModules: [],
    stateId: []
});

const rules = computed(() => ({
    id: { required },
    shortName: { required },
    fullName: { required },
    stateId: { required }
}));

const v$ = useVuelidate(rules, state);

const {
    data: modules,
    isLoading: isLoadingModules,
    isSuccess: isSuccessModules
} = await useQuery({
    queryKey: ["modules"],
    queryFn: () => manualGetModules(),
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
        label: "fullNameRoleLabel", 
        placeholder: "fullNameRolePlaceholder", 
        icon: "role",
        errorKey: "fullName",
    },
    { 
        id: 2, 
        model: "shortName", 
        label: "shortNameRoleLabel", 
        placeholder: "shortNameRolePlaceholder", 
        icon: "role",
        errorKey: "shortName",
    },
    { 
        id: 3, 
        model: "stateId", 
        label: "stateRoleLabel",
        placeholder: "stateRolePlaceholder",  
        errorKey: "stateId",
        options: states,
        success: isSuccessStates,
        loading: isLoadingStates,
        select: true
    }
]);

const { isError } = await useQuery({
    queryKey: ["rolesById", slugId, user.value.user.fullName],
    queryFn: () => getWithId("Role", slugId.value),
    select: (data) => {
        state.value.id = data.id;
        state.value.shortName = data.shortName;
        state.value.fullName = data.fullName;
        state.value.roleModules = [...data.roleModules];
        state.value.stateId = [data.stateId];
    },
    enabled: isShow
});

watch(isError, (value) => {
    if (value) {
        router.push(routes.ROLE.path);
    }
});

const { mutate: updateMutate, status } = useMutation({
    onMutate: (body) => {
        body.stateId = body.stateId[0];
    },
    mutationFn: (body) => updateById("Role", body),
    onSuccess: (response) => {
        if (!response?.success) return;

        state.value = clearState(state.value);

        queryClient.invalidateQueries({ queryKey: ["roles"] });
        queryClient.invalidateQueries({ queryKey: ["rolesById", slugId] });
        queryClient.invalidateQueries({ queryKey: ["rolesList"] });
        queryClient.invalidateQueries({ queryKey: ["orgUsers"] });
        
        router.push(routes.ROLE.path);

        setTimeout(() => toast.success(t("updateToast")), 150);
    }
});

const submitHandler = () => {
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
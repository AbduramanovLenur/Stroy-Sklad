<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="editRolesTitle" 
                :to="routes.ROLES.path"
            />
            <form class="manage__form form-manage" @submit.prevent="submitHandler">
                <FormInput 
                    v-for="input in inputs"
                    :key="input.id"
                    v-model="state[input.model]"
                    :width="500" 
                    :placeholder="$t(input.placeholder)"
                    :name="input.icon"
                    :error="v$?.[input.errorKey]?.$error" 
                    :textError="v$?.[input.errorKey]?.$errors[0]?.$message"
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
                    :placeholder="select?.placeholder"
                    :textError="v$?.[select?.errorKey]?.$errors[0]?.$message"
                    :success="select.success"
                    :loading="select.loading"
                >
                    {{ $t(select.label) }}
                </FormSelect>
                <ActionsModules 
                    v-if="isSuccessModules"
                    v-model="state.roleModules"
                    :actions="modules"
                />
                <CustomButton 
                    v-if="isSuccessModules"
                    :className="`form__submit manage__submit ${v$?.fullName.$errors[0]?.$message ? 'centered' : ''}`"
                >
                    {{ $t("formButton") }}
                </CustomButton>
            </form>
            <Spinner v-if="isLoadingModules" />
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
import { manualGetModules, manualGetStates } from "@/services/manual.services.js";
import { routes } from "@/utils/routes.js";
import { actionModules } from "@/utils/action-modules.js";

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

const inputs = ref([
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
]);

const selects = ref([
    { 
        id: 1, 
        model: "stateId", 
        label: "stateRoleLabel",
        placeholder: "stateRolePlaceholder",  
        errorKey: "stateId",
        options: states,
        success: isSuccessStates,
        loading: isLoadingStates
    }
]);

const { isError } = await useQuery({
    queryKey: ["rolesById", slugId],
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
        router.push(routes.HOME.path);
    }
});

const { mutate: updateMutate } = useMutation({
    onMutate: (body) => {
        body.stateId = body.stateId[0];
    },
    mutationFn: (body) => updateById("Role", body),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["roles"] });
        queryClient.invalidateQueries({ queryKey: ["rolesById", slugId] });
        queryClient.invalidateQueries({ queryKey: ["rolesList"] });
        
        router.push(routes.ROLES.path);
    }
});

const submitHandler = () => {
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
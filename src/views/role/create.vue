<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="addNewRolesTitle" 
                :to="routes.ROLE.path"
            />
            <form class="manage__form form-manage" @submit.prevent="submitHandler">
                <template v-for="field in fields" :key="field.id">
                    <FormInput 
                        v-if="!field?.select"
                        v-model="state[field.model]"
                        :width="500" 
                        :placeholder="$t(field.placeholder)"
                        :name="field.icon"
                        :error="v$?.[field.errorKey]?.$error" 
                        :textError="v$?.[field.errorKey]?.$errors[0]?.$message"
                    >
                        {{ $t(field.label) }}
                    </FormInput>
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
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
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
import { create } from "@/services/crud.services.js";
import { manualGetModules } from "@/services/manual.services.js";
import { routes } from "@/utils/routes.js";
import { actionModules } from "@/utils/action-modules.js";
import { clearState } from "@/utils/secondary-functions.js";

const queryClient = useQueryClient();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShow = computed(() => !!user?.value.user?.modules?.includes(actionModules.ROLE.CREATE));

const state = ref({
    shortName: "",
    fullName: "",
    roleModules: []
});

const rules = computed(() => ({
    shortName: { required },
    fullName: { required }
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
]);

const { mutate: createMutate, status } = useMutation({
    mutationFn: (body) => create("Role", body),
    onSuccess: (response) => {
        if (!response?.success) return;

        state.value = clearState(state.value);

        queryClient.invalidateQueries({ queryKey: ["roles"] });
        queryClient.invalidateQueries({ queryKey: ["rolesList"] });
        
        router.push(routes.ROLE.path);

        setTimeout(() => toast.success(t("createToast")), 150);
    }
});

const submitHandler = () => {
    v$.value.$validate();

    if (v$.value.$errors.length) {
        return;
    }

    const formData = { ...state.value };

    createMutate(formData);

    v$.value.$reset();
}
</script>

<style lang="scss" scoped>

</style>
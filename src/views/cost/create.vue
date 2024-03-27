<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="addNewExpensesTitle" 
                :to="routes.EXPENS.path"
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
                <CustomButton 
                    :className="`form__submit ${v$?.fullName.$errors[0]?.$message ? 'centered' : ''}`"
                >
                    {{ $t("formButton") }}
                </CustomButton>
            </form>
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
import { useQueryClient, useMutation } from "@tanstack/vue-query";
import { create } from "@/services/crud.services.js";
import { routes } from "@/utils/routes.js";
import { actionModules } from "@/utils/action-modules.js";
import { clearState } from "@/utils/secondary-functions.js";

const queryClient = useQueryClient();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShow = computed(() => !!user?.value.user?.modules?.includes(actionModules.EXPENS.CREATE));

const state = ref({
    fullName: "",
});

const rules = computed(() => ({
    fullName: { required },
}));

const v$ = useVuelidate(rules, state);

const fields = ref([
    { 
        id: 1, 
        model: "fullName", 
        label: "nameExpensesLabel", 
        placeholder: "nameExpensesPlaceholder", 
        icon: "input-company",
        errorKey: "fullName",
    }
]);

const { mutate: createMutate } = useMutation({
    mutationFn: (body) => create("cost", body),
    onSuccess: (response) => {
        if (!response?.success) return;

        state.value = clearState(state.value);
        
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        queryClient.invalidateQueries({ queryKey: ["costsList"] });
        
        router.push(routes.EXPENS.path);

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

<style lang="scss" scoped></style>
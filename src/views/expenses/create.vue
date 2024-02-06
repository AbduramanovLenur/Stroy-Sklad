<template>
    <section class="manage section-height">
        <div class="manage__inner section-padding">
            <Title>
                {{ $t("addNewExpensesTitle") }}
            </Title>
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
import { useVuelidate } from "@vuelidate/core";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { required } from "@/utils/i18n-validators.js";
import { useQueryClient, useMutation } from "@tanstack/vue-query";
import { create } from "@/services/crud.services.js";
import { routes } from "@/utils/routes.js";

const queryClient = useQueryClient();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const state = ref({
    fullName: "",
    organizationId: "",
});

const rules = computed(() => ({
    fullName: { required },
    organizationId: { required },
}));

const v$ = useVuelidate(rules, state);

const inputs = ref([
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
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        router.push(routes.EXPENSES.path);
    }
});

const submitHandler = () => {
    // const organizationId = localStorage.getItem("organizationId");
    const organizationId = 1;
    state.value.organizationId = organizationId;

    v$.value.$validate();

    if (v$.value.$errors.length) {
        return;
    }

    createMutate(state.value);
    v$.value.$reset();
}
</script>

<style lang="scss" scoped></style>
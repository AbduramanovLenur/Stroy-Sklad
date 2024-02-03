<template>
    <section class="manage section-height">
        <div class="manage__inner section-padding">
            <Title>
                {{ $t("addNewProductTitle") }}
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
                    :className="`form__submit ${v$?.fullname.$errors[0]?.$message ? 'centered' : ''}`"
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
    fullname: "",
    organizationId: ""
});

const rules = computed(() => ({
    fullname: { required },
    organizationId: { required }
}));

const v$ = useVuelidate(rules, state);

const inputs = ref([
    { 
        id: 1, 
        model: "fullname", 
        label: "nameProductsLabel", 
        placeholder: "nameProductsPlaceholder", 
        icon: "pen",
        errorKey: "fullname",
    }
]);

const { mutate: createMutate } = useMutation({
    mutationFn: (body) => create("construction_material", body),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        router.push(routes.PRODUCTS.path);
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
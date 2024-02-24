<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="addNewProductTitle" 
                :to="routes.PRODUCTS.path"
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
                <CustomButton 
                    :className="`form__submit ${v$?.quantityTypeId.$errors[0]?.$message ? 'centered' : ''}`"
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
import { 
    useQueryClient,
    useQuery, 
    useMutation 
} from "@tanstack/vue-query";
import { create } from "@/services/crud.services.js";
import { manualQuantityTypes } from "@/services/manual.services.js";
import { routes } from "@/utils/routes.js";
import { actionModules } from "@/utils/action-modules.js";

const queryClient = useQueryClient();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShow = computed(() => !!user?.value.user?.modules?.includes(actionModules.PRODUCT.CREATE));

const state = ref({
    fullname: "",
    quantityTypeId: []
});

const rules = computed(() => ({
    fullname: { required },
    quantityTypeId: { required }
}));

const v$ = useVuelidate(rules, state);

const {
    data: quantityTypes,
    isSuccess: isSuccessQunatityTypes,
    isLoading: isLoadingQunatityTypes
} = await useQuery({
    queryKey: ["types"],
    queryFn: () => manualQuantityTypes(),
    enabled: isShow
});

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

const selects = ref([
    { 
        id: 1, 
        model: "quantityTypeId", 
        label: "qunatityTypesProductsLabel", 
        placeholder: "qunatityTypesProductsPlaceholder",
        errorKey: "quantityTypeId",
        options: quantityTypes,
        success: isSuccessQunatityTypes,
        loading: isLoadingQunatityTypes
    }
]);

const { mutate: createMutate } = useMutation({
    onMutate: (body) => {
        body.quantityTypeId = body.quantityTypeId[0];
    },
    mutationFn: (body) => create("construction_material", body),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["materialsList"] });

        router.push(routes.PRODUCTS.path);
    }
});

const submitHandler = () => {
    v$.value.$validate();

    if (v$.value.$errors.length) {
        return;
    }

    createMutate(state.value);
    v$.value.$reset();
}
</script>

<style lang="scss" scoped></style>
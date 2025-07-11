<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="editProductTitle" 
                :to="routes.PRODUCT.path"
            />
            <form class="manage__form form-manage" @submit.prevent="submitHandler">
                <template v-for="field in fields" :key="field.id">
                    <FormInput 
                        v-if="!field?.select"
                        v-model="state[field.model]"
                        :placeholder="$t(field.placeholder)"
                        :name="field.icon"
                        :error="v$?.[field?.errorKey]?.$error" 
                        :textError="v$?.[field?.errorKey]?.$errors[0]?.$message"
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
import { manualQuantityTypes, manualGetStates } from "@/services/manual.services.js";
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

const isShow = computed(() => !!user?.value.user?.modules?.includes(actionModules.PRODUCT.UPDATE));

const slugId = ref(route.params.id);

const state = ref({
    id: "",
    fullname: "",
    quantityTypeId: [],
    stateId: []
});

const rules = computed(() => ({
    id: { required },
    fullname: { required },
    quantityTypeId: { required },
    stateId: { required }
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
        model: "fullname", 
        label: "nameProductsLabel", 
        placeholder: "nameProductsPlaceholder", 
        icon: "pen",
        errorKey: "fullname",
    },
    { 
        id: 2, 
        model: "quantityTypeId", 
        label: "qunatityTypesProductsLabel", 
        placeholder: "qunatityTypesProductsPlaceholder",
        errorKey: "quantityTypeId",
        options: quantityTypes,
        success: isSuccessQunatityTypes,
        loading: isLoadingQunatityTypes,
        select: true
    },
    { 
        id: 3, 
        model: "stateId", 
        label: "stateProductsLabel", 
        placeholder: "stateProductsPlaceholder",
        errorKey: "stateId",
        options: states,
        success: isSuccessStates,
        loading: isLoadingStates,
        select: true
    }
]);

const { isError } = await useQuery({
    queryKey: ["productById", slugId, user.value.user.fullName],
    queryFn: () => getWithId("construction_material", slugId.value),
    select: (data) => {
        state.value.id = data.id;
        state.value.fullname = data.fullname;
        state.value.quantityTypeId = [data.quantityTypeId];
        state.value.stateId = [data.stateId];
    },
    enabled: isShow
});

watch(isError, (value) => {
    if (value) {
        router.push(routes.PRODUCT.path);
    }
});

const { mutate: updateMutate, status } = useMutation({
    onMutate: (body) => {
        body.quantityTypeId = body.quantityTypeId[0];
        body.stateId = body.stateId[0];
    },
    mutationFn: (body) => updateById("construction_material", body),
    onSuccess: (response) => {
        if (!response?.success) return;

        state.value = clearState(state.value);

        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["productById", slugId] });
        queryClient.invalidateQueries({ queryKey: ["materialsList"] });
        
        router.push(routes.PRODUCT.path);

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
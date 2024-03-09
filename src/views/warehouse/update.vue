<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="editProductTitle" 
                :to="routes.WAREHOUSE.path"
            />
            <form class="manage__form form-manage" @submit.prevent="submitHandler">
                <FormInput 
                    v-for="input in inputs"
                    :key="input.id"
                    v-model="state[input.model]"
                    :width="500" 
                    :placeholder="$t(input.placeholder)"
                    :name="input.icon"
                    :error="v$?.[input?.errorKey]?.$error" 
                    :textError="v$?.[input?.errorKey]?.$errors[0]?.$message"
                >
                    {{ $t(input.label) }}
                </FormInput>
                <FormSelect 
                    v-for="select in selects"
                    :key="select.id"
                    v-model.trim="state[select.model]" 
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
                    :className="`form__submit ${v$?.stateId.$errors[0]?.$message ? 'centered' : ''}`"
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
import { useVuelidate } from "@vuelidate/core";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { required } from "@/utils/i18n-validators.js";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/userStore";
import { 
    useQueryClient, 
    useQuery, 
    useMutation 
} from "@tanstack/vue-query";
import { getWithId, updateById } from "@/services/crud.services.js";
import { 
    manualQuantityTypes, 
    manualGetStates, 
    manualConstructionMaterial 
} from "@/services/manual.services.js";
import { routes } from "@/utils/routes.js";
import { actionModules } from "@/utils/action-modules.js";
import { clearState } from "@/utils/secondary-functions.js";

const queryClient = useQueryClient();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const { t } = useI18n();

const slugId = ref(route.params.id);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShow = computed(() => !!user?.value.user?.modules?.includes(actionModules.WAREHOUSE.UPDATE));

const state = ref({
    id: "",
    materialId: [],
    quantity: "",
    quantityTypeId: [],
    stateId: []
});

const rules = computed(() => ({
    id: { required },
    materialId: { required },
    quantity: { required },
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
    data: materials,
    isSuccess: isSuccessMaterials,
    isLoading: isLoadingMaterials
} = await useQuery({
    queryKey: ["materialsList", { organizationId: user.value.user.organizationId }],
    queryFn: () => manualConstructionMaterial(),
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
        model: "quantity", 
        label: "quantityWarehouseLabel", 
        placeholder: "quantityWarehousePlaceholder", 
        icon: "list",
        errorKey: "quantity",
    }
]);

const selects = ref([
    { 
        id: 1, 
        model: "materialId", 
        label: "materialsWarehouseLabel", 
        placeholder: "materialsWarehousePlaceholder",
        errorKey: "materialId",
        options: materials,
        success: isSuccessMaterials,
        loading: isLoadingMaterials
    },
    { 
        id: 2, 
        model: "quantityTypeId", 
        label: "qunatityTypesWarehouseLabel", 
        placeholder: "qunatityTypesWarehousePlaceholder",
        errorKey: "quantityTypeId",
        options: quantityTypes,
        success: isSuccessQunatityTypes,
        loading: isLoadingQunatityTypes
    },
    { 
        id: 3, 
        model: "stateId", 
        label: "stateWarehouseLabel", 
        placeholder: "stateWarehousePlaceholder",
        errorKey: "stateId",
        options: states,
        success: isSuccessStates,
        loading: isLoadingStates
    }
]);

const { isError } = await useQuery({
    queryKey: ["warehouseById", slugId],
    queryFn: () => getWithId("warehouse", slugId.value),
    select: (data) => {
        state.value.id = data.id;
        state.value.materialId = [data.materialId];
        state.value.quantity = data.quantity;
        state.value.quantityTypeId = [data.quantityTypeId];
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
        body.materialId = body.materialId[0];
        body.quantityTypeId = body.quantityTypeId[0];
        body.stateId = body.stateId[0];
    },
    mutationFn: (body) => updateById("warehouse", body),
    onSuccess: (response) => {
        // if (!response?.success) return;

        state.value = clearState(state.value);

        queryClient.invalidateQueries({ queryKey: ["warehouse"] });
        queryClient.invalidateQueries({ queryKey: ["warehouseById", slugId] });
        
        router.push(routes.WAREHOUSE.path);
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
<template>
    <section class="manage section-height shadowed">
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
import { useQueryClient, useQuery, useMutation } from "@tanstack/vue-query";
import { getWithId, updateById } from "@/services/crud.services.js";
import { manualQuantityTypes, manualGetStates, manualConstructionMaterial } from "@/services/manual.services.js";
import { routes } from "@/utils/routes.js";

const queryClient = useQueryClient();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const { t } = useI18n();

const slugId = ref(route.params.id);

const organizationId = ref(localStorage.getItem("organizationId"));

const {
    data: quantityTypes,
    isSuccess: isSuccessQunatityTypes,
    isLoading: isLoadingQunatityTypes
} = await useQuery({
    queryKey: ["types"],
    queryFn: () => manualQuantityTypes()
});

const {
    data: materials,
    isSuccess: isSuccessMaterials,
    isLoading: isLoadingMaterials
} = await useQuery({
    queryKey: ["materials", { organizationId }],
    queryFn: () => manualConstructionMaterial(organizationId.value)
});

const {
    data: states,
    isSuccess: isSuccessStates,
    isLoading: isLoadingStates
} = await useQuery({
    queryKey: ["states"],
    queryFn: () => manualGetStates()
});

const state = ref({
    id: "",
    materialId: [],
    quantity: "",
    quantityTypeId: [],
    organizationId: "",
    stateId: []
});

const rules = computed(() => ({
    id: { required },
    materialId: { required },
    quantity: { required },
    quantityTypeId: { required },
    organizationId: { required },
    stateId: { required }
}));

const v$ = useVuelidate(rules, state);

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
        state.value.organizationId = data.organizationId;
        state.value.stateId = [data.stateId];
    }
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
    onSuccess: () => {
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

    updateMutate(state.value);
    v$.value.$reset();
}
</script>

<style lang="scss" scoped>

</style>
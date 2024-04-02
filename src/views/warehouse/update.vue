<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="editProductTitle" 
                :to="routes.WAREHOUSE.path"
            />
            <form class="manage__form form-manage" @submit.prevent="submitHandler">
                <template v-for="field in fields" :key="field.id">
                    <FormInput 
                        v-if="!field?.select"
                        v-model="state[field.model]"
                        :width="500" 
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
                        :width="500" 
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
import { getWithId, updateById } from "@/services/crud.services.js"
import {
manualConstructionMaterial,
manualGetStates
} from "@/services/manual.services.js"
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

const slugId = ref(route.params.id);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShow = computed(() => !!user?.value.user?.modules?.includes(actionModules.WAREHOUSE.UPDATE));

const state = ref({
    id: "",
    materialId: [],
    quantity: "",
    stateId: []
});

const rules = computed(() => ({
    id: { required },
    materialId: { required },
    quantity: { required },
    stateId: { required }
}));

const v$ = useVuelidate(rules, state);

const {
    data: materials,
    isSuccess: isSuccessMaterials,
    isLoading: isLoadingMaterials
} = await useQuery({
    queryKey: ["materialsList", { 
        organizationId: user.value.user.organizationId, 
        name: user.value.user.fullName 
    }],
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

const fields = ref([
    { 
        id: 1, 
        model: "materialId", 
        label: "materialsWarehouseLabel", 
        placeholder: "materialsWarehousePlaceholder",
        errorKey: "materialId",
        options: materials,
        success: isSuccessMaterials,
        loading: isLoadingMaterials,
        select: true
    },
    { 
        id: 2, 
        model: "quantity", 
        label: "quantityWarehouseLabel", 
        placeholder: "quantityWarehousePlaceholder", 
        icon: "list",
        errorKey: "quantity",
    },
    { 
        id: 3, 
        model: "stateId", 
        label: "stateWarehouseLabel", 
        placeholder: "stateWarehousePlaceholder",
        errorKey: "stateId",
        options: states,
        success: isSuccessStates,
        loading: isLoadingStates,
        select: true
    }
]);

const { isError } = await useQuery({
    queryKey: ["warehouseById", slugId, user.value.user.fullName],
    queryFn: () => getWithId("warehouse", slugId.value),
    select: (data) => {
        state.value.id = data.id;
        state.value.materialId = [data.materialId];
        state.value.quantity = data.quantity;
        state.value.stateId = [data.stateId];
    },
    enabled: isShow
});

watch(isError, (value) => {
    if (value) {
        router.push(routes.WAREHOUSE.path);
    }
});

const { mutate: updateMutate, status } = useMutation({
    onMutate: (body) => {
        body.materialId = body.materialId[0];
        body.stateId = body.stateId[0];
    },
    mutationFn: (body) => updateById("warehouse", body),
    onSuccess: (response) => {
        if (!response?.success) return;

        state.value = clearState(state.value);

        queryClient.invalidateQueries({ queryKey: ["warehouse"] });
        queryClient.invalidateQueries({ queryKey: ["warehouseById", slugId] });
        queryClient.invalidateQueries({ queryKey: ["reports", "warehouse"] });
        
        router.push(routes.WAREHOUSE.path);

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
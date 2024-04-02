<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="addNewProductTitle" 
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
                        :error="v$?.[field.errorKey]?.$error" 
                        :textError="v$?.[field.errorKey]?.$errors[0]?.$message"
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
                    :className="`form__submit ${v$?.quantity.$errors[0]?.$message ? 'centered' : ''}`"
                    :disabled="status === 'pending'"
                >
                    {{ $t("formButton") }}
                </CustomButton>
            </form>
        </div>
    </section>
</template>

<script setup>
import { create } from "@/services/crud.services.js"
import { manualConstructionMaterial } from "@/services/manual.services.js"
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
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { useToast } from "vue-toastification"

const queryClient = useQueryClient();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShow = computed(() => !!user?.value.user?.modules?.includes(actionModules.WAREHOUSE.CREATE));

const state = ref({
    materialId: [],
    quantity: ""
});

const rules = computed(() => ({
    materialId: { required },
    quantity: { required }
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
    }
]);

const { mutate: createMutate, status } = useMutation({
    onMutate: (body) => {
        body.materialId = body.materialId[0];
    },
    mutationFn: (body) => create("warehouse", body),
    onSuccess: (response) => {
        if (!response?.success) return;

        state.value = clearState(state.value);

        queryClient.invalidateQueries({ queryKey: ["warehouse"] });
        queryClient.invalidateQueries({ queryKey: ["reports", "warehouse"] });
        
        router.push(routes.WAREHOUSE.path);

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
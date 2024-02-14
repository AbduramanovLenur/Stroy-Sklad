<template>
    <section class="manage section-height shadowed">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="addNewApplicationTitle" 
                :to="routes.APPLICATIONS.path"
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
                    :type="input?.type"
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
                    :isMultiSelect="select?.multiple"
                >
                    {{ $t(select.label) }}
                </FormSelect>
                <CustomButton 
                    :className="`form__submit`"
                >
                    {{ $t("formButton") }}
                </CustomButton>
            </form>
        </div>
    </section>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useVuelidate } from "@vuelidate/core";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { required } from "@/utils/i18n-validators.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/vue-query";
import { create } from "@/services/crud.services.js";
import { 
    manualConstructionMaterial, 
    manualGetFloors, 
    manualGetCost, 
    manualGetObjects, 
    manualGetBlocks,
    manualGetRoles
} from "@/services/manual.services.js";
import { routes } from "@/utils/routes.js";

const queryClient = useQueryClient();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const organizationId = ref(localStorage.getItem("organizationId"));
const userId = ref(localStorage.getItem("id"));

const isSubmit = ref(false);

const {
    data: floors,
    isSuccess: isSuccessFloors,
    isLoading: isLoadingFloors
} = await useQuery({
    queryKey: ["floors", { organizationId }],
    queryFn: () => manualGetFloors(organizationId.value)
});

const {
    data: costs,
    isSuccess: isSuccessCosts,
    isLoading: isLoadingCosts
} = await useQuery({
    queryKey: ["costs", { organizationId }],
    queryFn: () => manualGetCost(organizationId.value)
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
    data: roles,
    isSuccess: isSuccessRoles,
    isLoading: isLoadingRoles
} = await useQuery({
    queryKey: ["roles"],
    queryFn: () => manualGetRoles()
});

const {
    data: objects,
    isSuccess: isSuccessObjects,
    isLoading: isLoadingObjects
} = await useQuery({
    queryKey: ["objectsList", { organizationId }],
    queryFn: () => manualGetObjects(organizationId.value)
});

const state = ref({
    userId: userId.value,
    deadline: "",
    constructionMaterialIds: [],
    buildingObjectId: [],
    buildingBlockId: [],
    floorId: [],
    costId: [],
    roleIds: []
});

const valueObject = computed(() => state.value.buildingObjectId);

const isEnabled = computed(() => !!valueObject.value.length);

watch(valueObject, () => {
    if (!isSubmit.value) {
        state.value.buildingBlockId = [];
    }
}, { immediate: true });

const {
    data: blocks,
    isSuccess: isSuccessBlocks,
    isLoading: isLoadingBlocks
} = await useQuery({
    queryKey: ["blocksList", { blockId: valueObject }],
    queryFn: () => manualGetBlocks(valueObject.value),
    enabled: isEnabled
});

const rules = computed(() => ({
    userId: { required },
    deadline: { required },
    constructionMaterialIds: { required },
    buildingObjectId: { required },
    buildingBlockId: { required },
    floorId: { required },
    costId: { required },
    roleIds: { required }
}));

const v$ = useVuelidate(rules, state);

const inputs = ref([
    { 
        id: 1, 
        model: "deadline", 
        label: "dateAppLabel", 
        placeholder: "dateAppPlaceholder", 
        icon: "date",
        errorKey: "deadline",
        type: "date"
    }
]);

const selects = ref([
    { 
        id: 1, 
        model: "floorId", 
        label: "floorsAppLabel", 
        placeholder: "floorsAppPlaceholder", 
        errorKey: "floorId",
        options: floors,
        success: isSuccessFloors,
        loading: isLoadingFloors
    },
    { 
        id: 2, 
        model: "constructionMaterialIds", 
        label: "materialsAppLabel", 
        placeholder: "materialsAppPlaceholder",
        errorKey: "constructionMaterialIds",
        options: materials,
        success: isSuccessMaterials,
        loading: isLoadingMaterials,
        multiple: true
    },
    { 
        id: 3, 
        model: "costId", 
        label: "costAppLabel", 
        placeholder: "costAppPlaceholder",
        errorKey: "costId",
        options: costs,
        success: isSuccessCosts,
        loading: isLoadingCosts
    },
    { 
        id: 4, 
        model: "buildingObjectId", 
        label: "objectAppLabel", 
        placeholder: "objectAppPlaceholder",
        errorKey: "buildingObjectId",
        options: objects,
        success: isSuccessObjects,
        loading: isLoadingObjects
    },
    { 
        id: 5, 
        model: "buildingBlockId", 
        label: "blockAppLabel", 
        placeholder: "blockAppPlaceholder",
        errorKey: "buildingBlockId",
        options: blocks,
        success: isSuccessBlocks,
        loading: isLoadingBlocks
    },
    { 
        id: 6, 
        model: "roleIds", 
        label: "appRoleLabel", 
        placeholder: "appRolePlaceholder", 
        errorKey: "roleIds", 
        options: roles, 
        success: isSuccessRoles,
        loading: isLoadingRoles,
        multiple: true
    },
]);

const { mutate: createMutate } = useMutation({
    onMutate: (body) => {
        isSubmit.value = true;

        body.buildingObjectId = body.buildingObjectId[0];
        body.buildingBlockId = body.buildingBlockId[0];
        body.floorId = body.floorId[0];
        body.costId = body.costId[0];
    },
    mutationFn: (body) => create("application", body),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["applications"] });
        router.push(routes.APPLICATIONS.path);
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
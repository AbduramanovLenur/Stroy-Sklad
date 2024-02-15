<template>
    <section class="manage section-height shadowed">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="editObjectTitle" 
                :to="routes.OBJECTS.path"
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
import { manualGetRegions, manualGetDistricts, manualGetStates } from "@/services/manual.services.js";
import { routes } from "@/utils/routes.js";

const queryClient = useQueryClient();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const { t } = useI18n();

const slugId = ref(route.params.id);

const isSubmit = ref(false);
const isFirstChange = ref(false);

const state = ref({
    id: "",
    name: "",
    address: "",
    regionId: [],
    districtId: [],
    stateId: []
});

const {
    data: regions,
    isSuccess: isSuccessRegions,
    isLoading: isLoadingRegions
} = await useQuery({
    queryKey: ["regions"],
    queryFn: () => manualGetRegions()
});

const valueRegion = computed(() => state.value.regionId);

const isEnabled = computed(() => !!valueRegion.value.length);

watch(valueRegion, () => {
    if (!isFirstChange.value && !isSubmit.value) {
        state.value.districtId = [];
    }

    isFirstChange.value = false;
}, { immediate: true });

const {
    data: districts,
    isSuccess: isSuccessDistricts,
    isLoading: isLoadingDistricts
} = await useQuery({
    queryKey: ["districts", { districtId: valueRegion }],
    queryFn: () => manualGetDistricts(valueRegion.value),
    enabled: isEnabled
});

const {
    data: states,
    isSuccess: isSuccessStates,
    isLoading: isLoadingStates
} = await useQuery({
    queryKey: ["states"],
    queryFn: () => manualGetStates()
});

const rules = computed(() => ({
    id: { required },
    name: { required },
    address: { required },
    regionId: { required },
    districtId: { required },
    stateId: { required }
}));

const v$ = useVuelidate(rules, state);

const inputs = ref([
    { 
        id: 1, 
        model: "name", 
        label: "nameObjectLabel", 
        placeholder: "nameObjectPlaceholder", 
        icon: "input-company",
        errorKey: "name",
    },
    { 
        id: 2, 
        model: "address", 
        label: "addressObjectLabel", 
        placeholder: "addressObjectPlaceholder", 
        icon: "address",
        errorKey: "address",
    },
]);

const selects = ref([
    { 
        id: 1, 
        model: "regionId", 
        label: "regionObjectLabel",
        placeholder: "regionObjectPlaceholder", 
        options: regions,
        errorKey: "regionId",
        success: isSuccessRegions,
        loading: isLoadingRegions
    },
    { 
        id: 2, 
        model: "districtId", 
        label: "districtObjectLabel",
        placeholder: "districtObjectPlaceholder",  
        options: districts,
        errorKey: "districtId",
        success: isSuccessDistricts,
        loading: isLoadingDistricts
    },
    { 
        id: 3, 
        model: "stateId", 
        label: "stateObjectLabel",
        placeholder: "stateObjectLabel",  
        options: states,
        success: isSuccessStates,
        loading: isLoadingStates
    }
]);

const { isError } = await useQuery({
    queryKey: ["objectById", slugId],
    queryFn: () => getWithId("building_object", slugId.value),
    select: (data) => {
        state.value.id = data.id;
        state.value.name = data.fullName;
        state.value.address = data.address;
        state.value.regionId = [data.regionId];
        state.value.districtId = [data.districtId];
        state.value.stateId = [data.stateId];

        isFirstChange.value = true;
    }
});

watch(isError, (value) => {
    if (value) {
        router.push(routes.HOME.path);
    }
});

const { mutate: updateMutate } = useMutation({
    onMutate: (body) => {
        isSubmit.value = true;

        body.regionId = body.regionId[0];
        body.districtId = body.districtId[0];
        body.stateId = body.stateId[0];
    },
    mutationFn: (body) => updateById("building_object", body),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["objects"] });
        queryClient.invalidateQueries({ queryKey: ["objectById", slugId] });
        queryClient.invalidateQueries({ queryKey: ["objectsList"] });
        router.push(routes.OBJECTS.path);
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
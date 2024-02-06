<template>
    <section class="manage section-height">
        <div class="manage__inner section-padding">
            <Title>
                {{ $t("editObjectTitle") }}
            </Title>
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

const {
    data: regions,
    isSuccess: isSuccessRegions,
    isLoading: isLoadingRegions
} = await useQuery({
    queryKey: ["regions"],
    queryFn: () => manualGetRegions()
});

const {
    data: districts,
    isSuccess: isSuccessDistricts,
    isLoading: isLoadingDistricts
} = await useQuery({
    queryKey: ["districts"],
    queryFn: () => manualGetDistricts()
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
    name: "",
    address: "",
    organizationId: "",
    regionId: "",
    districtId: "",
    stateId: ""
});

const rules = computed(() => ({
    id: { required },
    name: { required },
    address: { required },
    organizationId: { required },
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
        options: regions,
        errorKey: "regionId",
        success: isSuccessRegions,
        loading: isLoadingRegions
    },
    { 
        id: 2, 
        model: "districtId", 
        label: "districtObjectLabel", 
        options: districts,
        errorKey: "districtId",
        success: isSuccessDistricts,
        loading: isLoadingDistricts
    },
    { 
        id: 3, 
        model: "stateId", 
        label: "stateObjectLabel", 
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
        state.value.organizationId = data.organizationId;
        state.value.regionId = data.regionId;
        state.value.districtId = data.districtId;
        state.value.address = data.address;
        state.value.stateId = data.stateId;
    }
});

watch(isError, (value) => {
    if (value) {
        router.push(routes.HOME.path);
    }
});

const { mutate: updateMutate } = useMutation({
    mutationFn: (body) => updateById("building_object", body),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["objects"] });
        queryClient.invalidateQueries({ queryKey: ["objectById", slugId] });
        router.push(routes.OBJECTS.path);
    }
});

const submitHandler = async () => {
    // const organizationId = localStorage.getItem("organizationId");
    const organizationId = 1;
    state.value.organizationId = organizationId;

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
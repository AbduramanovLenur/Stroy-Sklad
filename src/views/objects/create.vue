<template>
    <section class="manage section-height shadowed">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="addNewObjectTitle" 
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
                    :className="`form__submit ${v$?.districtId.$errors[0]?.$message ? 'centered' : ''}`"
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
import { useQueryClient, useQuery, useMutation } from "@tanstack/vue-query";
import { create } from "@/services/crud.services.js";
import { manualGetRegions, manualGetDistricts } from "@/services/manual.services.js";
import { routes } from "@/utils/routes.js";

const queryClient = useQueryClient();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

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

const state = ref({
    name: "",
    address: "",
    regionId: [],
    districtId: [],
});

const rules = computed(() => ({
    name: { required },
    address: { required },
    regionId: { required },
    districtId: { required },
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
        errorKey: "regionId",
        options: regions,
        success: isSuccessRegions,
        loading: isLoadingRegions
    },
    { 
        id: 2, 
        model: "districtId", 
        label: "districtObjectLabel", 
        placeholder: "districtObjectPlaceholder",
        errorKey: "districtId",
        options: districts,
        success: isSuccessDistricts,
        loading: isLoadingDistricts
    }
]);

const { mutate: createMutate } = useMutation({
    onMutate: (body) => {
        body.regionId = body.regionId[0];
        body.districtId = body.districtId[0];
    },
    mutationFn: (body) => create("building_object", body),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["objects"] });
        queryClient.invalidateQueries({ queryKey: ["objectsList"] });
        router.push(routes.OBJECTS.path);
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
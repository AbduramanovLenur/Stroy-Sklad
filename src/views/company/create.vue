<template>
    <section class="manage section-height shadowed">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="addNewCompanyTitle" 
                :to="routes.COMPANIES.path"
            />
            <form class="manage__form form-manage" @submit.prevent="submitHandler">
                <FormInput 
                    v-for="input in inputs"
                    :key="input.id"
                    v-model="state[input.model]"
                    :width="500" 
                    :placeholder="$t(input.placeholder)"
                    :name="input.icon"
                    :error="v$?.[input.errorKey].$error" 
                    :type="input?.type"
                    :textError="v$?.[input.errorKey].$errors[0]?.$message"
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
                    :className="`form__submit ${v$?.districtId.$errors[0]?.$message ? 'centered' : ''}`"
                >
                    {{ $t("formButton") }}
                </CustomButton>
            </form>
        </div>
    </section>
</template>

<script setup>
import { create } from "@/services/crud.services.js"
import { manualGetDistricts, manualGetRegions } from "@/services/manual.services.js"
import { required } from "@/utils/i18n-validators.js"
import { routes } from "@/utils/routes.js"
import { clearState } from "@/utils/secondary-functions.js"
import {
useMutation,
useQuery,
useQueryClient
} from "@tanstack/vue-query"
import { useVuelidate } from "@vuelidate/core"
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { useToast } from "vue-toastification"

const queryClient = useQueryClient();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const isSubmit = ref(false);

const state = ref({
    fullName: "",
    inn: "",
    address: "",
    phoneNumber: "",
    director: "",
    regionId: [],
    districtId: []
});

const rules = computed(() => ({
    fullName: { required },
    inn: { required },
    address: { required },
    phoneNumber: { required },
    director: { required },
    regionId: { required },
    districtId: { required },
}));

const v$ = useVuelidate(rules, state);

const {
    data: regions,
    isSuccess: isSuccessRegions,
    isLoading: isLoadingRegions
} = await useQuery({
    queryKey: ["regions"],
    queryFn: () => manualGetRegions(),
});

const valueRegion = computed(() => state.value.regionId[0]);

const isEnabled = computed(() => !!valueRegion.value);

watch(valueRegion, () => {
    if (!isSubmit.value) {
        state.value.districtId = [];
    }
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

const inputs = ref([
    { 
        id: 1, 
        model: "fullName", 
        label: "nameOrganizationLabel", 
        placeholder: "nameOrganizationPlaceholder", 
        icon: "input-company",
        errorKey: "fullName",
    },
    { 
        id: 2, 
        model: "inn", 
        label: "innOrganizationLabel", 
        placeholder: "innOrganizationPlaceholder", 
        icon: "tin",
        errorKey: "inn",
        type: "number"
    },
    { 
        id: 3, 
        model: "address", 
        label: "addressOrganizationLabel", 
        placeholder: "addressOrganizationPlaceholder", 
        icon: "address",
        errorKey: "address",
    },
    { 
        id: 4, 
        model: "phoneNumber", 
        label: "phoneOrganizationLabel", 
        placeholder: "phoneOrganizationPlaceholder", 
        icon: "phone",
        errorKey: "phoneNumber",
        type: "number"
    },
    { 
        id: 5, 
        model: "director", 
        label: "directorOrganizationLabel", 
        placeholder: "directorOrganizationPlaceholder", 
        icon: "person",
        errorKey: "director",
    }
]);

const selects = ref([
    { 
        id: 1, 
        model: "regionId", 
        label: "regionOrganizationLabel", 
        placeholder: "regionOrganizationPlaceholder",
        errorKey: "regionId",
        options: regions,
        success: isSuccessRegions,
        loading: isLoadingRegions
    },
    { 
        id: 2, 
        model: "districtId", 
        label: "districtOrganizationLabel", 
        placeholder: "districtOrganizationPlaceholder",
        errorKey: "districtId",
        options: districts,
        success: isSuccessDistricts,
        loading: isLoadingDistricts
    }
]);

const { mutate: createMutate } = useMutation({
    onMutate: (body) => {
        isSubmit.value = true;
        
        body.regionId = body.regionId[0];
        body.districtId = body.districtId[0];
    },
    mutationFn: (body) => create("organization", body),
    onSuccess: (response) => {
        if (!response?.success) return;

        state.value = clearState(state.value);

        queryClient.invalidateQueries({ queryKey: ["companies"] });
        queryClient.invalidateQueries({ queryKey: ["organizations"] });
        
        router.push(routes.COMPANIES.path);
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
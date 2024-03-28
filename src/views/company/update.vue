<template>
    <section class="manage section-height shadowed">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="editCompanyTitle" 
                :to="routes.COMPANIES.path"
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
                        :type="field?.type"
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
    manualGetDistricts,
    manualGetRegions,
    manualGetStates
} from "@/services/manual.services.js"
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
import { useRoute, useRouter } from "vue-router"
import { useToast } from "vue-toastification"

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
    fullName: "",
    inn: "",
    address: "",
    phoneNumber: "",
    director: "",
    regionId: [],
    districtId: [],
    stateId: []
});

const rules = computed(() => ({
    id: { required },
    fullName: { required },
    inn: { required },
    address: { required },
    phoneNumber: { required },
    director: { required },
    regionId: { required },
    districtId: { required },
    stateId: { required }
}));

const v$ = useVuelidate(rules, state);

const {
    data: regions,
    isSuccess: isSuccessRegions,
    isLoading: isLoadingRegions
} = await useQuery({
    queryKey: ["regions"],
    queryFn: () => manualGetRegions()
});

const valueRegion = computed(() => state.value.regionId[0]);

const isEnabled = computed(() => !!valueRegion.value);

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

const fields = ref([
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
    },
    { 
        id: 6, 
        model: "regionId", 
        label: "regionOrganizationLabel", 
        placeholder: "regionOrganizationPlaceholder",
        errorKey: "regionId",
        options: regions,
        success: isSuccessRegions,
        loading: isLoadingRegions,
        select: true
    },
    { 
        id: 7, 
        model: "districtId", 
        label: "districtOrganizationLabel", 
        placeholder: "districtOrganizationPlaceholder",
        errorKey: "districtId",
        options: districts,
        success: isSuccessDistricts,
        loading: isLoadingDistricts,
        select: true
    },
    { 
        id: 8, 
        model: "stateId", 
        label: "stateOrganizationLabel", 
        placeholder: "stateOrganizationPlaceholder",
        errorKey: "stateId",
        options: states,
        success: isSuccessStates,
        loading: isLoadingStates,
        select: true
    }
]);

const { isError } = await useQuery({
    queryKey: ["companyById", slugId],
    queryFn: () => getWithId("organization", slugId.value),
    select: (data) => {
        state.value.id = data.id;
        state.value.fullName = data.fullName;
        state.value.inn = data.inn;
        state.value.address = data.address;
        state.value.phoneNumber = data.phoneNumber;
        state.value.director = data.director;
        state.value.regionId = [data?.regionId];
        state.value.districtId = [data?.districtId];
        state.value.stateId = [data?.stateId];

        isFirstChange.value = true;
    }
});

watch(isError, (value) => {
    if (value) {
        router.push(routes.COMPANIES.path);
    }
});

const { mutate: updateMutate, status } = useMutation({
    onMutate: (body) => {
        isSubmit.value = true;

        body.regionId = body.regionId[0];
        body.districtId = body.districtId[0];
        body.stateId = body.stateId[0];
    },
    mutationFn: (body) => updateById("organization", body),
    onSuccess: async (response) => {
        if (!response?.success) return;

        state.value = clearState(state.value);
        
        queryClient.invalidateQueries({ queryKey: ["companies"] });
        queryClient.invalidateQueries({ queryKey: ["companyById", slugId] });
        queryClient.invalidateQueries({ queryKey: ["organizations"] });

        router.push(routes.COMPANIES.path);

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

<style lang="scss" scoped></style>
<template>
    <section class="manage section-height">
        <div class="manage__inner section-padding">
            <Title>
                {{ $t("editCompanyTitle") }}
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
    fullName: "",
    inn: "",
    address: "",
    phoneNumber: "",
    director: "",
    regionId: "",
    districtId: "",
    stateId: ""
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
        options: regions,
        success: isSuccessRegions,
        loading: isLoadingRegions,
        errorKey: "regionId"
    },
    { 
        id: 2, 
        model: "districtId", 
        label: "districtOrganizationLabel", 
        options: districts,
        success: isSuccessDistricts,
        loading: isLoadingDistricts,
        errorKey: "districtId"
    },
    { 
        id: 3, 
        model: "stateId", 
        label: "stateOrganizationLabel", 
        options: states,
        success: isSuccessStates,
        loading: isLoadingStates,
        errorKey: "stateId"
    }
]);

const { isError } = await useQuery({
    queryKey: ["companiesById", slugId],
    queryFn: () => getWithId("organization", slugId.value),
    select: (data) => {
        state.value.id = data.id;
        state.value.fullName = data.fullName;
        state.value.inn = data.inn;
        state.value.address = data.address;
        state.value.phoneNumber = data.phoneNumber;
        state.value.director = data.director;
        state.value.regionId = data.regionId;
        state.value.districtId = data.districtId;
        state.value.stateId = data.stateId;
    }
});

watch(isError, (value) => {
    if (value) {
        router.push(routes.HOME.path);
    }
});

const { mutate: updateMutate } = useMutation({
    mutationFn: (body) => updateById("organization", body),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["companies"] });
        queryClient.invalidateQueries({ queryKey: ["companiesById", slugId] });
        router.push(routes.COMPANIES.path);
        // setTimeout(() => toast.success(t("updateToast")), 1000);
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

<style lang="scss" scoped></style>
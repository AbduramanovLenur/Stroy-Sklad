<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="editObjectTitle" 
                :to="routes.OBJECT.path"
            />
            <form class="manage__form form-manage" @submit.prevent="submitHandler">
                <template v-for="field in fields" :key="field.id">
                    <FormInput 
                        v-if="!field?.select"
                        v-model="state[field.model]"
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
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/userStore";
import { useVuelidate } from "@vuelidate/core";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { required } from "@/utils/i18n-validators.js";
import { 
    useQueryClient, 
    useQuery, 
    useMutation 
} from "@tanstack/vue-query";
import { getWithId, updateById } from "@/services/crud.services.js";
import { 
    manualGetRegions, 
    manualGetDistricts, 
    manualGetStates 
} from "@/services/manual.services.js";
import { routes } from "@/utils/routes.js";
import { actionModules } from "@/utils/action-modules.js";
import { clearState } from "@/utils/secondary-functions.js";

const queryClient = useQueryClient();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const { t } = useI18n();

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShow = computed(() => !!user?.value.user?.modules?.includes(actionModules.OBJECT.UPDATE));

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

const rules = computed(() => ({
    id: { required },
    name: { required },
    address: { required },
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
    queryFn: () => manualGetRegions(),
    enabled: isShow
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
    queryFn: () => manualGetStates(),
    enabled: isShow
});

const fields = ref([
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
    { 
        id: 3, 
        model: "regionId", 
        label: "regionObjectLabel",
        placeholder: "regionObjectPlaceholder", 
        errorKey: "regionId",
        options: regions,
        success: isSuccessRegions,
        loading: isLoadingRegions,
        select: true
    },
    { 
        id: 4, 
        model: "districtId", 
        label: "districtObjectLabel",
        placeholder: "districtObjectPlaceholder",  
        errorKey: "districtId",
        options: districts,
        success: isSuccessDistricts,
        loading: isLoadingDistricts,
        select: true
    },
    { 
        id: 5, 
        model: "stateId", 
        label: "stateObjectLabel",
        placeholder: "stateObjectLabel",  
        errorKey: "stateId",
        options: states,
        success: isSuccessStates,
        loading: isLoadingStates,
        select: true
    }
]);

const { isError } = await useQuery({
    queryKey: ["objectById", slugId, user.value.user.fullName],
    queryFn: () => getWithId("building_object", slugId.value),
    select: (data) => {
        state.value.id = data.id;
        state.value.name = data.fullName;
        state.value.address = data.address;
        state.value.regionId = [data.regionId];
        state.value.districtId = [data.districtId];
        state.value.stateId = [data.stateId];

        isFirstChange.value = true;
    },
    enabled: isShow
});

watch(isError, (value) => {
    if (value) {
        router.push(routes.OBJECT.path);
    }
});

const { mutate: updateMutate, status } = useMutation({
    onMutate: (body) => {
        isSubmit.value = true;

        body.regionId = body.regionId[0];
        body.districtId = body.districtId[0];
        body.stateId = body.stateId[0];
    },
    mutationFn: (body) => updateById("building_object", body),
    onSuccess: (response) => {
        if (!response?.success) return;

        state.value = clearState(state.value);

        queryClient.invalidateQueries({ queryKey: ["objects"] });
        queryClient.invalidateQueries({ queryKey: ["objectById", slugId] });
        queryClient.invalidateQueries({ queryKey: ["objectsList"] });
        queryClient.invalidateQueries({ queryKey: ["blocks"] });
        
        router.push(routes.OBJECT.path);

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
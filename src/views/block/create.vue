<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="addNewBlocksTitle" 
                :to="routes.BLOCK.path"
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
                    :className="`form__submit ${v$?.districtId.$errors[0]?.$message ? 'centered' : ''}`"
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
import { useRouter } from "vue-router";
import { useVuelidate } from "@vuelidate/core";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { required } from "@/utils/i18n-validators.js";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/userStore";
import { 
    useQueryClient, 
    useQuery, 
    useMutation 
} from "@tanstack/vue-query";
import { create } from "@/services/crud.services.js";
import { 
    manualGetRegions, 
    manualGetDistricts, 
    manualGetObjects 
} from "@/services/manual.services.js";
import { routes } from "@/utils/routes.js";
import { actionModules } from "@/utils/action-modules.js";
import { clearState } from "@/utils/secondary-functions.js";

const queryClient = useQueryClient();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShow = computed(() => !!user?.value.user?.modules?.includes(actionModules.BLOCK.CREATE));

const isSubmit = ref(false);

const state = ref({
    fullname: "",
    numberOfFloors: "",
    roomsOnFloor: "",
    address: "",
    buildingObjectId: [],
    regionId: [],
    districtId: [],
});

const rules = computed(() => ({
    fullname: { required },
    numberOfFloors: { required },
    roomsOnFloor: { required },
    address: { required },
    buildingObjectId: { required },
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
    enabled: isShow
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

const {
    data: objectsList,
    isSuccess: isSuccessObjectsList,
    isLoading: isLoadingObjectsList
} = await useQuery({
    queryKey: ["objectsList", { 
        organizationId: user.value.user.organizationId, 
        name: user.value.user.fullName 
    }],
    queryFn: () => manualGetObjects(),
    enabled: isShow
});

const fields = ref([
    { 
        id: 1, 
        model: "fullname", 
        label: "blocksFullNameLabel", 
        placeholder: "blocksFullNamePlaceholder", 
        icon: "input-company", 
        errorKey: "fullname",
    },
    { 
        id: 2, 
        model: "numberOfFloors", 
        label: "blocksNumberLabel", 
        placeholder: "blocksNumberPlaceholder", 
        icon: "signature", 
        errorKey: "numberOfFloors",
    },
    { 
        id: 3, 
        model: "roomsOnFloor", 
        label: "blocksRoomsLabel", 
        placeholder: "blocksRoomsPlaceholder", 
        icon: "door", 
        errorKey: "roomsOnFloor",
    },
    { 
        id: 4, 
        model: "address", 
        label: "blocksAddressLabel",
        placeholder: "blocksAddressPlaceholder", 
        icon: "address", 
        errorKey: "address",
    },
    { 
        id: 5, 
        model: "buildingObjectId", 
        label: "buildIdBlocksLabel", 
        placeholder: "buildIdBlocksPlaceholder",
        errorKey: "buildingObjectId", 
        options: objectsList, 
        success: isSuccessObjectsList,
        loading: isLoadingObjectsList,
        select: true
    },
    { 
        id: 6, 
        model: "regionId", 
        label: "regionBlocksLabel", 
        placeholder: "regionBlocksPlaceholder",
        errorKey: "regionId",
        options: regions, 
        success: isSuccessRegions,
        loading: isLoadingRegions,
        select: true
    },
    { 
        id: 7, 
        model: "districtId", 
        label: "districtBlocksLabel", 
        placeholder: "districtBlocksPlaceholder",
        errorKey: "districtId", 
        options: districts, 
        success: isSuccessDistricts,
        loading: isLoadingDistricts,
        select: true
    }
]);

const { mutate: createMutate, status } = useMutation({
    onMutate: (body) => {
        isSubmit.value = true;

        body.buildingObjectId = body.buildingObjectId[0];
        body.regionId = body.regionId[0];
        body.districtId = body.districtId[0];
    },
    mutationFn: (body) => create("building_block", body),
    onSuccess: (response) => {
        if (!response?.success) return;

        state.value = clearState(state.value);

        queryClient.invalidateQueries({ queryKey: ["blocks"] });
        queryClient.invalidateQueries({ queryKey: ["blocksList"] });
        queryClient.invalidateQueries({ queryKey: ["floorsList"] });

        router.push(routes.BLOCK.path);

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
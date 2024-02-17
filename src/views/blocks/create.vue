<template>
    <section class="manage section-height shadowed">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="addNewBlocksTitle" 
                :to="routes.BLOCKS.path"
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
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useVuelidate } from "@vuelidate/core";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { required } from "@/utils/i18n-validators.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/vue-query";
import { create } from "@/services/crud.services.js";
import { manualGetRegions, manualGetDistricts, manualGetObjects } from "@/services/manual.services.js";
import { routes } from "@/utils/routes.js";

const queryClient = useQueryClient();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const organizationId = ref(localStorage.getItem("organizationId"));

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
    queryKey: ["objectsList", { organizationId }],
    queryFn: () => manualGetObjects()
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

const inputs = ref([
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
    }
]);

const selects = ref([
    { 
        id: 1, 
        model: "buildingObjectId", 
        label: "buildIdBlocksLabel", 
        placeholder: "buildIdBlocksPlaceholder",
        errorKey: "buildingObjectId", 
        options: objectsList, 
        success: isSuccessObjectsList,
        loading: isLoadingObjectsList
    },
    { 
        id: 2, 
        model: "regionId", 
        label: "regionBlocksLabel", 
        placeholder: "regionBlocksPlaceholder",
        errorKey: "regionId",
        options: regions, 
        success: isSuccessRegions,
        loading: isLoadingRegions
    },
    { 
        id: 3, 
        model: "districtId", 
        label: "districtBlocksLabel", 
        placeholder: "districtBlocksPlaceholder",
        errorKey: "districtId", 
        options: districts, 
        success: isSuccessDistricts,
        loading: isLoadingDistricts
    }
]);

const { mutate: createMutate } = useMutation({
    onMutate: (body) => {
        isSubmit.value = true;

        body.buildingObjectId = body.buildingObjectId[0];
        body.regionId = body.regionId[0];
        body.districtId = body.districtId[0];
    },
    mutationFn: (body) => create("building_block", body),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["blocks"] });
        router.push(routes.BLOCKS.path);
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
<template>
    <section class="manage section-height shadowed">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="editCompanyTitle" 
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
import { manualGetRegions, manualGetDistricts, manualGetStates, manualGetObjects } from "@/services/manual.services.js";
import { routes } from "@/utils/routes.js";

const queryClient = useQueryClient();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const { t } = useI18n();

const slugId = ref(route.params.id);

const organizationId = ref(localStorage.getItem("organizationId"));

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
    data: objectsList,
    isSuccess: isSuccessObjectsList,
    isLoading: isLoadingObjectsList
} = await useQuery({
    queryKey: ["objectsList", { organizationId }],
    queryFn: () => manualGetObjects(organizationId.value)
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
    fullname: "",
    numberOfFloors: "",
    roomsOnFloor: "",
    address: "",
    buildingObjectId: [],
    regionId: [],
    districtId: [],
    stateId: [],
});

const rules = computed(() => ({
    id: { required },
    fullname: { required },
    numberOfFloors: { required },
    roomsOnFloor: { required },
    address: { required },
    buildingObjectId: { required },
    regionId: { required },
    districtId: { required },
    stateId: { required }
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
    },
    { 
        id: 4, 
        model: "stateId", 
        label: "stateBlocksLabel", 
        placeholder: "stateBlocksPlaceholder",
        errorKey: "stateId",
        options: states,
        success: isSuccessStates,
        loading: isLoadingStates
    }
]);

const { isError } = await useQuery({
    queryKey: ["blocksById", slugId],
    queryFn: () => getWithId("building_block", slugId.value),
    select: (data) => {
        state.value.id = data.id;
        state.value.fullname = data.fullName;
        state.value.numberOfFloors = data.numberOfFloors;
        state.value.roomsOnFloor = data.roomsOnFloor;
        state.value.address = data.address;
        state.value.buildingObjectId = [data.buildingObjectId];
        state.value.regionId = [data.regionId];
        state.value.districtId = [data.districtId];
        state.value.stateId = [data.stateId];
    }
});

watch(isError, (value) => {
    if (value) {
        router.push(routes.HOME.path);
    }
});

const { mutate: updateMutate } = useMutation({
    onMutate: (body) => {
        body.buildingObjectId = body.buildingObjectId[0];
        body.regionId = body.regionId[0];
        body.districtId = body.districtId[0];
        body.stateId = body.stateId[0];
    },
    mutationFn: (body) => updateById("building_block", body),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["blocks"] });
        queryClient.invalidateQueries({ queryKey: ["blocksById", slugId] });
        router.push(routes.BLOCKS.path);
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
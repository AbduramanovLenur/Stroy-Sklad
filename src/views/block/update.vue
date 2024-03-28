<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="editBlocksTitle" 
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
                        :error="v$?.[field?.errorKey]?.$error" 
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
    manualGetObjects,
    manualGetRegions,
    manualGetStates
} from "@/services/manual.services.js"
import { useUserStore } from "@/store/userStore"
import { actionModules } from "@/utils/action-modules.js"
import { required } from "@/utils/i18n-validators.js"
import { routes } from "@/utils/routes.js"
import { clearState } from "@/utils/secondary-functions.js"
import {
useMutation,
useQuery,
useQueryClient
} from "@tanstack/vue-query"
import { useVuelidate } from "@vuelidate/core"
import { storeToRefs } from "pinia"
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

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShow = computed(() => !!user?.value.user?.modules?.includes(actionModules.BLOCK.UPDATE));

const isSubmit = ref(false);
const isFirstChange = ref(false);

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
    data: objectsList,
    isSuccess: isSuccessObjectsList,
    isLoading: isLoadingObjectsList
} = await useQuery({
    queryKey: ["objectsList", { organizationId: user.value.user.organizationId }],
    queryFn: () => manualGetObjects(),
    enabled: isShow
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
    },
    { 
        id: 8, 
        model: "stateId", 
        label: "stateBlocksLabel", 
        placeholder: "stateBlocksPlaceholder",
        errorKey: "stateId",
        options: states,
        success: isSuccessStates,
        loading: isLoadingStates,
        select: true
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

        isFirstChange.value = true;
    },
    enabled: isShow
});

watch(isError, (value) => {
    if (value) {
        router.push(routes.BLOCK.path);
    }
});

const { mutate: updateMutate, status } = useMutation({
    onMutate: (body) => {
        isSubmit.value = true;
        
        body.buildingObjectId = body.buildingObjectId[0];
        body.regionId = body.regionId[0];
        body.districtId = body.districtId[0];
        body.stateId = body.stateId[0];
    },
    mutationFn: (body) => updateById("building_block", body),
    onSuccess: (response) => {
        if (!response?.success) return;

        state.value = clearState(state.value);

        queryClient.invalidateQueries({ queryKey: ["blocks"] });
        queryClient.invalidateQueries({ queryKey: ["blocksById", slugId] });
        queryClient.invalidateQueries({ queryKey: ["blocksList"] });

        router.push(routes.BLOCK.path);

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
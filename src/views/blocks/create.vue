<template>
    <section class="manage section-height">
        <div class="manage__inner section-padding">
            <Title>
                {{ $t("addNewBlocksTitle") }}
            </Title>
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

// const {
//     data: objectsList,
//     isSuccess: isSuccessObjectsList,
//     isLoading: isLoadingObjectsList
// } = await useQuery({
//     queryKey: ["objectsList"],
//     queryFn: () => manualGetObjectsList()
// });

const state = ref({
    fullname: "",
    numberOfFloors: "",
    roomsOnFloor: "",
    address: "",
    buildingObjectId: 1,
    regionId: "",
    districtId: "",
});

const rules = computed(() => ({
    fullname: { required },
    numberOfFloors: { required },
    roomsOnFloor: { required },
    address: { required },
    // buildingObjectId: { required },
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
        options: [], 
        errorKey: "buildingObjectId", 
        success: true,
        loading: false
    },
    { 
        id: 2, 
        model: "regionId", 
        label: "regionBlocksLabel", 
        options: regions, 
        errorKey: "regionId",
        success: isSuccessRegions,
        loading: isLoadingRegions
    },
    { 
        id: 3, 
        model: "districtId", 
        label: "districtBlocksLabel", 
        options: districts, 
        errorKey: "districtId", 
        success: isSuccessDistricts,
        loading: isLoadingDistricts
    }
]);

const { mutate: createMutate } = useMutation({
    mutationFn: (body) => create("building_block", body),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["blocks"] });
        router.push(routes.BLOCKS.path);
    }
});

const submitHandler = () => {
    // const organizationId = localStorage.getItem("organizationId");
    // state.value.organizationId = organizationId;

    v$.value.$validate();

    if (v$.value.$errors.length) {
        return;
    }

    createMutate(state.value);
    v$.value.$reset();
}
</script>

<style lang="scss" scoped></style>
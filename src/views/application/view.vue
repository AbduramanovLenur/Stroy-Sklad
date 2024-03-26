<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="addNewApplicationTitle" 
                :to="routes.APPLICATION.path"
            />
            <form v-if="isSuccess" class="manage__form" @submit.prevent>
                <div class="manage__overlay">
                    <FormInput 
                        v-for="input in inputs"
                        :key="input.id"
                        v-model="state[input.model]"
                        :width="500"
                        :placeholder="$t(input.placeholder)"
                        :name="input.icon"
                        :type="input?.type"
                        :isDisabled="true"
                    >
                        {{ $t(input.label) }}
                    </FormInput>
                    <FormSelect 
                        v-for="select in selects"
                        :key="select.id"
                        v-model.trim="state[select.model]" 
                        :width="500" 
                        :options="select.options"
                        :placeholder="select?.placeholder"
                        :success="select.success"
                        :loading="select.loading"
                        :isMultiSelect="select?.multiple"
                        :isDisabled="true"
                    >
                        {{ $t(select.label) }}
                    </FormSelect>
                </div>
                <SubTable
                    :headers="headers"
                    :table="state.applicationTables"
                />
                <FormTextarea
                    v-model.trim="state.details"
                    :width="500" 
                    :placeholder="$t('appCommentPlaceholder')"
                    :isDisabled="true"
                >
                    {{ $t("appCommentLabel") }}
                </FormTextarea>
                <!-- (state.statusId !== 7 && state.statusId !== 15) &&  -->
                <div 
                    v-if="state.allowedActionRoleIds.includes(user?.user?.roleId)"
                    class="manage__triggers" 
                >
                    <MyButton 
                        v-if="user?.user?.modules?.includes(actionModules.APPLICATION.CONFIRM)"
                        icon="approve" 
                        type="submit" 
                        color="green" 
                        :width="180" 
                        @click="() => isOpenAcceptedModal = true"
                    >
                        {{ $t("acceptButton") }}
                    </MyButton>
                    <MyButton 
                        v-if="user?.user?.modules?.includes(actionModules.APPLICATION.REFUSAL)"
                        icon="refusal" 
                        type="submit" 
                        color="red" 
                        :width="180" 
                        @click="() => isOpenRefusedModal = true"
                    >
                        {{ $t("cancelButton") }}
                    </MyButton>
                </div>
                <Histories :histories="state.histories" />
            </form>
            <Spinner 
                v-if="isLoading" 
            />
        </div>
        <ConfirmationModal 
            :isOpen="isOpenAcceptedModal"
            @onConfirmed="acceptHandler" 
            @onNotConfirmed="() => isOpenAcceptedModal = false"
        >
            {{ $t("sureConfirm") }}
        </ConfirmationModal>
        <ConfirmationModal 
            :isOpen="isOpenRefusedModal"
            @onConfirmed="cancelHandler" 
            @onNotConfirmed="() => isOpenRefusedModal = false"
        >
            {{ $t("sureRefused") }}
        </ConfirmationModal>
    </section>
</template>

<script setup>
import ConfirmationModal from "@/components/ConfirmationModal.vue"
import FormTextarea from "@/components/FormTextarea.vue"
import Histories from "@/components/Histories.vue"
import { acceptWithId, cancelWithId, getWithId } from "@/services/crud.services.js"
import {
manualConstructionMaterial,
manualGetBlocks,
manualGetCost,
manualGetFloors,
manualGetObjects,
} from "@/services/manual.services.js"
import { useUserStore } from "@/store/userStore"
import { actionModules } from "@/utils/action-modules.js"
import { routes } from "@/utils/routes.js"
import { createIdMap } from "@/utils/secondary-functions.js"
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query"
import { storeToRefs } from "pinia"
import { computed, ref, watch, watchEffect } from "vue"
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

const isShow = computed(() => user?.value.user?.modules?.includes(actionModules.APPLICATION.READ));

const isOpenAcceptedModal = ref(false);
const isOpenRefusedModal = ref(false);

const headers = ref([
    { id: 1, label: "appFloor", width: 20 },
    { id: 2, label: "appMaterial", width: 30 },
    { id: 3, label: "appCount", width: 20 },
    { id: 4, label: "appPrice", width: 30 },
]);

const state = ref({
    id: "",
    deadline: "",
    buildingObjectId: [],
    buildingBlockId: [],
    applicationTables: [],
    details: "",
    statusId: "",
    allowedActionRoleIds: [],
    histories: []
});

const {
    data: objects,
    isSuccess: isSuccessObjects,
    isLoading: isLoadingObjects
} = await useQuery({
    queryKey: ["objectsList", { organizationId: user.value.user.organizationId }],
    queryFn: () => manualGetObjects(),
    enabled: isShow
});

const valueObject = computed(() => state.value.buildingObjectId[0]);

const isEnabledBlocks = computed(() => !!valueObject.value);

const {
    data: blocks,
    isSuccess: isSuccessBlocks,
    isLoading: isLoadingBlocks
} = await useQuery({
    queryKey: ["blocksList", { blockId: valueObject, organizationId: user.value.user.organizationId }],
    queryFn: () => manualGetBlocks(valueObject.value),
    enabled: isEnabledBlocks
});

const valueBlock = computed(() => state.value.buildingBlockId[0]);

const isEnabled = computed(() => !!valueBlock.value);

const {
    data: floors,
    isSuccess: isSuccessFloors,
    isLoading: isLoadingFloors
} = await useQuery({
    queryKey: ["floorsList", { floorId: valueBlock, organizationId: user.value.user.organizationId }],
    queryFn: () => manualGetFloors(valueBlock.value),
    enabled: isEnabled
});

const {
    data: costs,
    isSuccess: isSuccessCosts,
    isLoading: isLoadingCosts
} = await useQuery({
    queryKey: ["costsList", { organizationId: user.value.user.organizationId }],
    queryFn: () => manualGetCost(),
    enabled: isEnabled
});

const {
    data: materials,
    isSuccess: isSuccessMaterials,
    isLoading: isLoadingMaterials
} = await useQuery({
    queryKey: ["materialsList", { organizationId: user.value.user.organizationId }],
    queryFn: () => manualConstructionMaterial(),
    enabled: isEnabled
});

const inputs = ref([
    { 
        id: 1, 
        model: "deadline", 
        label: "dateAppLabel", 
        placeholder: "dateAppPlaceholder", 
        icon: "date",
        errorKey: "deadline",
        type: "date"
    }
]);

const selects = ref([
    { 
        id: 1, 
        model: "buildingObjectId", 
        label: "objectAppLabel", 
        placeholder: "objectAppPlaceholder",
        errorKey: "buildingObjectId",
        options: objects,
        success: isSuccessObjects,
        loading: isLoadingObjects
    },
    { 
        id: 2, 
        model: "buildingBlockId", 
        label: "blockAppLabel", 
        placeholder: "blockAppPlaceholder",
        errorKey: "buildingBlockId",
        options: blocks,
        success: isSuccessBlocks,
        loading: isLoadingBlocks
    }
]);

const { isError } = await useQuery({
    queryKey: ["applicationsById", slugId],
    queryFn: () => getWithId("application", slugId.value),
    select: (data) => {
        state.value.id = data.id;
        state.value.deadline = data.deadline;
        state.value.buildingObjectId = [data.buildingObjectId];
        state.value.buildingBlockId = [data.buildingBlockId];
        state.value.applicationTables = [...data.applicationTables];
        state.value.details = data.details;
        state.value.statusId = data.statusId;
        state.value.allowedActionRoleIds = data.allowedActionRoleIds;
        state.value.histories = data.applicationHistories;
    },
    enabled: isShow
});

const floorMap = computed(() => createIdMap(floors.value || []));
const costMap = computed(() => createIdMap(costs.value || []));
const materialMap = computed(() => createIdMap(materials.value || []));

const getFloorIdValue = (elem) => floorMap.value[elem.floorId]?.name;
const getCostIdValue = (elem) => costMap.value[elem.costId]?.name;
const getConstructionMaterialIdValue = (elem) => materialMap.value[elem?.constructionMaterialId]?.name;

const isSuccess = ref(false);
const isLoading = ref(true);

watchEffect(() => {
    const keysFloor = Object.keys(floorMap.value)?.length;
    const keysCost = Object.keys(costMap.value)?.length;
    const keysMaterial =  Object.keys(materialMap.value)?.length;
    const applicationTables = state.value.applicationTables.length;

    if (!!(keysFloor && keysCost && keysMaterial && applicationTables)) {
        state.value.applicationTables = state.value.applicationTables.map((elem) => {
            const object = { 
                ...elem,
                floorValue: getFloorIdValue(elem),
                costValue: getCostIdValue(elem),
                constructionMaterialValue: getConstructionMaterialIdValue(elem)
            };

            return object;
        });

        isSuccess.value = true;
        isLoading.value = false;
    }
});

watch(isError, (value) => {
    if (value) {
        router.push(routes.HOME.path);
    }
});

const { mutate: cancelMutate } = useMutation({
    mutationFn: (idx) => cancelWithId("application", idx),
    onSuccess: (response) => {
        if (!response?.success) return;

        queryClient.invalidateQueries({ queryKey: ["applications"] });
        queryClient.invalidateQueries({ queryKey: ["applicationsById", slugId] });

        router.push(routes.APPLICATION.path);

        setTimeout(() => toast.success(t("cancelToast")), 150);
    }
});

const { mutate: acceptMutate } = useMutation({
    mutationFn: (idx) => acceptWithId("application", idx),
    onSuccess: (response) => {
        if (!response?.success) return;

        queryClient.invalidateQueries({ queryKey: ["applications"] });
        queryClient.invalidateQueries({ queryKey: ["applicationsById", slugId] });

        router.push(routes.APPLICATION.path);

        setTimeout(() => toast.success(t("acceptToast")), 150);
    }
});

const cancelHandler = () => {
    cancelMutate(slugId.value);
}

const acceptHandler = () => {
    acceptMutate(slugId.value);
}
</script>

<style lang="scss" scoped>
.manage {
    &__overlay {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 30px 50px;
        margin-top: 20px;
        margin-bottom: 50px;
        @media (max-width: 1536px) {
            gap: 20px;
        }
        @media (max-width: 1152px) {
            grid-template-columns: repeat(2, 1fr);
        }
        @media (max-width: 864px) {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
    }
    &__triggers {
        display: flex;
        align-items: center;
        gap: 30px;
        margin-top: 30px;
        @media (max-width: 640px) {
            flex-direction: column;
            gap: 20px;
        }
    }
}
</style>
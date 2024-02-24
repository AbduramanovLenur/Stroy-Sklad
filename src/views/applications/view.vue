<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="addNewApplicationTitle" 
                :to="routes.APPLICATIONS.path"
            />
            <form class="manage__form" @submit.prevent>
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
                        v-model="state[select.model]" 
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
                    v-if="isSuccessCosts && isSuccessMaterials && isSuccessFloors && subtableData"
                    :headers="headers"
                    :table="subtableData"
                />
                <Spinner v-if="isLoadingCosts || isLoadingMaterials || isLoadingFloors || !subtableData.length" />
                <FormTextarea 
                    v-for="input in textareas"
                    :key="input.id"
                    v-model="state[input.model]"
                    :width="500" 
                    :placeholder="$t(input.placeholder)"
                    :isDisabled="true"
                >
                    {{ $t(input.label) }}
                </FormTextarea>
                <div 
                    class="manage__triggers" 
                    v-if="(isSuccessCosts && isSuccessMaterials && isSuccessFloors) && (state.statusId !== 7 && state.statusId !== 15)"
                >
                    <MyButton icon="approve" type="submit" color="green" :width="180" @click="acceptHandler">
                        {{ $t("acceptButton") }}
                    </MyButton>
                    <MyButton icon="refusal" type="submit" color="red" :width="180" @click="cancelHandler">
                        {{ $t("cancelButton") }}
                    </MyButton>
                </div>
            </form>
        </div>
    </section>
</template>

<script setup>
import { ref, computed, watch, watchEffect } from "vue";
import FormTextarea from "@/components/FormTextarea.vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/userStore";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { useQueryClient, useQuery, useMutation } from "@tanstack/vue-query";
import { getWithId, cancelWithId, acceptWithId } from "@/services/crud.services.js";
import { 
    manualConstructionMaterial, 
    manualGetFloors, 
    manualGetCost, 
    manualGetObjects, 
    manualGetBlocks,
    manualGetRoles
} from "@/services/manual.services.js";
import { routes } from "@/utils/routes.js";
import { actionModules } from "@/utils/action-modules.js";
import { createIdMap } from "@/utils/secondary-functions.js";

const queryClient = useQueryClient();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const { t } = useI18n();

const slugId = ref(route.params.id);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShow = computed(() => !!user?.value.user?.modules?.includes(actionModules.APPLICATION.READ));

const subtableData = ref([]);

const headers = ref([
    { id: 1, label: "appFloor", width: 215 },
    { id: 2, label: "appPrice", width: 275 },
    { id: 4, label: "appMaterial", width: 275 },
    { id: 5, label: "appCount", width: 250 },
    { id: 3, label: "appCost" }
]);

const state = ref({
    id: "",
    deadline: "",
    buildingObjectId: [],
    buildingBlockId: [],
    roleIds: [],
    applicationTables: [],
    details: "",
    statusId: ""
});

const {
    data: roles,
    isSuccess: isSuccessRoles,
    isLoading: isLoadingRoles
} = await useQuery({
    queryKey: ["rolesList", { organizationId: user.value.user.organizationId }],
    queryFn: () => manualGetRoles(),
    enabled: isShow
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

const valueObject = computed(() => state.value.buildingObjectId);

const isEnabledBlocks = computed(() => !!valueObject.value.length);

const {
    data: blocks,
    isSuccess: isSuccessBlocks,
    isLoading: isLoadingBlocks
} = await useQuery({
    queryKey: ["blocksList", { blockId: valueObject }],
    queryFn: () => manualGetBlocks(valueObject.value),
    enabled: isEnabledBlocks
});

const valueBlock = computed(() => state.value.buildingBlockId);

const isEnabled = computed(() => !!valueBlock.value.length);

const {
    data: floors,
    isSuccess: isSuccessFloors,
    isLoading: isLoadingFloors
} = await useQuery({
    queryKey: ["floorsList", { floorId: valueBlock }],
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
    },
    { 
        id: 6, 
        model: "roleIds", 
        label: "appRoleLabel", 
        placeholder: "appRolePlaceholder", 
        errorKey: "roleIds", 
        options: roles, 
        success: isSuccessRoles,
        loading: isLoadingRoles,
        multiple: true
    }
]);

const textareas = ref([
    { 
        id: 1, 
        model: "details", 
        label: "appCommentLabel", 
        placeholder: "appCommentPlaceholder",
        errorKey: "details"
    }
]);

const { isError } = await useQuery({
    queryKey: ["blocksById", slugId],
    queryFn: () => getWithId("application", slugId.value),
    select: (data) => {
        state.value.id = data.id;
        state.value.deadline = data.deadline;
        state.value.buildingObjectId = [data.buildingObjectId];
        state.value.buildingBlockId = [data.buildingBlockId];
        state.value.roleIds = [...data.roleIds];
        state.value.applicationTables = [...data.applicationTables];
        state.value.details = data.details;
        state.value.statusId = data.statusId;
    },
    enabled: isShow
});

const floorMap = computed(() => createIdMap(floors.value || []));
const costMap = computed(() => createIdMap(costs.value || []));
const materialMap = computed(() => createIdMap(materials.value || []));

watchEffect(() => {
    if (Object.keys(floorMap.value).length && Object.keys(costMap.value).length && Object.keys(materialMap.value).length) {
        state.value.applicationTables.forEach((elem) => {
            const floorIdValue = floorMap.value[elem.floorId]?.name;
            const costIdValue = costMap.value[elem.costId]?.name;
            const constructionMaterialIdValue = materialMap.value[elem.constructionMaterialId]?.name;

            subtableData.value.push({
                floorValue: floorIdValue,
                costValue: costIdValue,
                constructionMaterialValue: constructionMaterialIdValue,
                count: elem.count,
                price: elem.price
            });
        });
    }
})

watch(isError, (value) => {
    if (value) {
        router.push(routes.HOME.path);
    }
});

const { mutate: cancelMutate } = useMutation({
    mutationFn: (idx) => cancelWithId("application", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["applications"] });
        queryClient.invalidateQueries({ queryKey: ["applicationsById", slugId] });

        router.push(routes.APPLICATIONS.path);
    }
});

const { mutate: acceptMutate } = useMutation({
    mutationFn: (idx) => acceptWithId("application", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["applications"] });
        queryClient.invalidateQueries({ queryKey: ["applicationsById", slugId] });

        router.push(routes.APPLICATIONS.path);
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
    }
}
</style>
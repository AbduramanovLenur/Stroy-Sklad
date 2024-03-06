<template>
    <section class="management-role section-height shadowed" v-if="isShow">
        <div class="management-role__inner section-padding">
            <div class="management-role__head">
                <Title>
                    {{ $t("managementTitle") }}
                </Title>
                <MyButton 
                    :to="routes.MANAGEMENT.path" 
                    icon="back" 
                    type="link" 
                    color="black"
                >
                    {{ $t("backButton") }}
                </MyButton>
            </div>
            <form class="management-role__form" @submit.prevent="submitHandler">
                <div class="management-role__selects">
                    <div 
                        class="management-role__select" 
                        v-for="(select, index) in state"
                        :key="select.uuid"
                    >
                        <div class="management-role__select-box">
                            <FormSelect 
                                v-model="select.roleIds" 
                                :width="500" 
                                :options="filteredRoles(index)"
                                placeholder="managementRolePlaceholder"
                                :success="isSuccess"
                                :loading="isLoading"
                                :isMultiSelect="true"
                            >
                                {{ $t(select.label) }}
                            </FormSelect>
                        </div>
                        <div class="management-role__actions">
                            <div
                                v-if="index + 1 !== state?.length" 
                                class="management-role__icon"
                                @click="() => addItem(index + 1)"
                            >
                                <Icon name="plus" />
                            </div>
                            <div
                                v-if="index !== 0 && index + 1 !== state?.length" 
                                class="management-role__icon"
                                @click="() => deleteItem(index)"
                            >
                                <Icon name="delete-role" />
                            </div>
                        </div>
                    </div>
                </div>
                <CustomButton className="form__submit">
                    {{ $t("formButton") }}
                </CustomButton>
            </form>
        </div>
    </section>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/userStore";
import { useI18n } from "vue-i18n";
import { 
    useQueryClient, 
    useQuery, 
    useMutation 
} from "@tanstack/vue-query";
import { getAll, createPositionRoles } from "@/services/crud.services.js";
import { manualGetRoles } from "@/services/manual.services.js";
import { routes } from "@/utils/routes.js";
import { actionModules } from "@/utils/action-modules.js";

const queryClient = useQueryClient();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShow = computed(() => !!user?.value.user?.modules?.includes(actionModules.MANAGEMENT_ROLE.CREATE));

const state = ref([
    { uuid: uuidv4(), roleIds: [], label: "creatorApp" },
    { uuid: uuidv4(), roleIds: [], label: "confirmApp" }
]);

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
    data: positions,
    isSuccess: isSuccessPositions,
    isLoading: isLoadingPositions
} = await useQuery({
    queryKey: ["positions", { organizationId: user.value.user.organizationId }],
    queryFn: () => getAll("application_position"),
    select: (data) => {
        if (!data.length) return;
        
        state.value = data.map((elem, index) => {
            let object = {};

            if (index === 0) {
                object = { uuid: uuidv4(), roleIds: [...elem.roleIds], label: "creatorApp" }
            } else if (index + 1 === data.length) {
                object = { uuid: uuidv4(), roleIds: [...elem.roleIds], label: "confirmApp" }
            } else {
                object = { uuid: uuidv4(), roleIds: [...elem.roleIds], label: "inspectorApp" }
            }

            return object;
        });

        return data;
    },
    enabled: isShow
});

const isSuccess = computed(() => isSuccessRoles.value && isSuccessPositions.value);
const isLoading = computed(() => isLoadingRoles.value && isLoadingPositions.value);

const addItem = (idx) => {
    state.value.splice(idx, 0, { uuid: uuidv4(), roleIds: [], label: "inspectorApp" });
}

const deleteItem = (idx) => {
    state.value.splice(idx, 1);
}

const filteredRoles = computed(() => {
    return (index) => {
        const usedRoles = state.value.reduce((acc, cur, idx) => {
            if (idx !== index) {
                acc.push(...cur.roleIds);
            }
            return acc;
        }, []);

        return roles.value?.filter(role => !usedRoles.includes(role.id));
    }
})

const { mutate: createMutate } = useMutation({
    onMutate: (body) => {
        body = body.map((elem) => {
            const object = { ...elem };

            delete object?.uuid;
            delete object?.label;

            return object;
        });
    },
    mutationFn: (body) => createPositionRoles("application_position", body),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["positions"] });
        queryClient.invalidateQueries({ queryKey: ["applications"] });
        queryClient.invalidateQueries({ queryKey: ["applicationsById"] });
    }
});

const submitHandler = () => {
    const isEmptyArray = state.value.some((value) => !value.roleIds.length)

    if (isEmptyArray) {
        toast.error(t("isEmptyRole"))
        return;
    }

    createMutate(state.value);
}
</script>

<style lang="scss" scoped>
.management-role {
    &__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 50px;
        @media (max-width: 900px) {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
        }
    }
    &__form {
        display: flex;
        flex-direction: column;
        gap: 50px;
        max-width: 585px;
        width: 100%;
        margin: 0 auto;
        @media (max-width: 900px) {
            max-width: 500px;
        }
    }
    &__selects {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: 60px;
        margin-top: 50px;
    }
    &__select {
        display: flex;
        gap: 15px;
        width: 100%;
        &-box {
            position: relative;
            max-width: 500px;
            width: 100%;
        }
        @media (max-width: 900px) {
            flex-direction: column;
        }
        &:not(:last-child) {
            .management-role__select-box {
                &::after {
                    content: "";
                    position: absolute;
                    bottom: -65px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-image: url("@/assets/images/icons/arrow-down.svg");
                    background-position: center;
                    background-repeat: no-repeat;
                    background-size: cover;
                    height: 50px;
                    width: 30px;
                    @media (max-width: 900px) {
                        bottom: -95px;
                    }
                }
            }
        }
    }
    &__actions {
        display: flex;
        align-items: center;
        gap: 15px;
        @media (max-width: 900px) {
            justify-content: space-between;
        }
    }
    &__icon {
        display: flex;
        align-items: center;
        margin-top: 30px;
        @media (max-width: 900px) {
            margin-top: 0;
        }
    }
}
</style>
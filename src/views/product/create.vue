<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="addNewProductTitle" 
                :to="routes.PRODUCT.path"
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
                    :className="`form__submit ${v$?.quantityTypeId?.$errors?.[0]?.$message ? 'centered' : ''}`"
                >
                    {{ $t("formButton") }}
                </CustomButton>
            </form>
            <form class="manage__file-form" @submit.prevent="submitWithExcelFile">
                <div class="manage__file-head">
                    <FormFile
                        :width="240" 
                        @onChangFile="handleFileUpload"
                    >
                        {{ $t("fileLabel") }}
                    </FormFile>
                    <CustomButton
                        v-if="state.data.length"
                        :width="240" 
                        className="form__submit"
                    >
                        {{ $t("formButton") }}
                    </CustomButton>
                </div>
                <SubTable
                    v-if="state.data.length"
                    :headers="headers"
                    :table="state.data"
                    @onActionDelete="deleteHandler"
                    :isShowDelete="true"
                />
            </form>
        </div>
    </section>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
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
import { create, createWithExcel } from "@/services/crud.services.js";
import { manualQuantityTypes } from "@/services/manual.services.js";
import { routes } from "@/utils/routes.js";
import { actionModules } from "@/utils/action-modules.js";
import { createIdMap, clearState } from "@/utils/secondary-functions.js";
import FormFile from "@/components/FormFile.vue";

const queryClient = useQueryClient();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShow = computed(() => !!user?.value.user?.modules?.includes(actionModules.PRODUCT.CREATE));

const headers = ref([
    { id: 1, label: "productName", width: 1000 },
    { id: 2, label: "quantityName", width: 200 }
]);

const state = ref({
    fullname: "",
    quantityTypeId: [],
    data: []
});

const rules = computed(() => ({
    fullname: { required },
    quantityTypeId: { required }
}));

const v$ = useVuelidate(rules, state);

const {
    data: quantityTypes,
    isSuccess: isSuccessQunatityTypes,
    isLoading: isLoadingQunatityTypes
} = await useQuery({
    queryKey: ["types"],
    queryFn: () => manualQuantityTypes(),
    enabled: isShow
});

const quantityTypesMap = computed(() => createIdMap(quantityTypes.value));

const getTypesIdValue = (elem) => quantityTypesMap?.value[elem]?.name;

const inputs = ref([
    { 
        id: 1, 
        model: "fullname", 
        label: "nameProductsLabel", 
        placeholder: "nameProductsPlaceholder", 
        icon: "pen",
        errorKey: "fullname",
    }
]);

const selects = ref([
    { 
        id: 1, 
        model: "quantityTypeId", 
        label: "qunatityTypesProductsLabel", 
        placeholder: "qunatityTypesProductsPlaceholder",
        errorKey: "quantityTypeId",
        options: quantityTypes,
        success: isSuccessQunatityTypes,
        loading: isLoadingQunatityTypes
    }
]);

const handleFileUpload = (value) => {
    state.value.data = value.map((elem, index) => ({ 
        id: index, 
        delId: uuidv4(), 
        fullname: elem[1], 
        quantityTypeId: elem[2], 
        quantityTypeValue: getTypesIdValue(elem[2])
    })).slice(1);
};

const deleteHandler = (idx) => {
    state.value.data = state.value.data.filter((elem) => elem.delId !== idx);
}

const { mutate: createMutate } = useMutation({
    onMutate: (body) => {
        body.quantityTypeId = body.quantityTypeId[0];
    },
    mutationFn: (body) => create("construction_material", body),
    onSuccess: (response) => {
        // if (!response?.success) return;

        state.value = clearState(state.value);

        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["materialsList"] });

        router.push(routes.PRODUCT.path);
    }
});

const { mutate: createWithExcelMutate } = useMutation({
    mutationFn: (body) => createWithExcel("construction_material", body),
    onSuccess: (response) => {
        // if (!response?.success) return;

        state.value = clearState(state.value);

        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["materialsList"] });

        router.push(routes.PRODUCT.path);
    }
});

const submitHandler = () => {
    v$.value.$validate();

    if (v$.value.$errors.length) {
        return;
    }

    const formData = { ...state.value };

    delete formData.data;

    createMutate(formData);

    v$.value.$reset();
}

const submitWithExcelFile = () => {
    const isAllExist = state.value.data.every((elem) => elem.fullname && elem.quantityTypeId);

    if (!isAllExist) {
        toast.error(t("isEmptyExcelFile"));
        return;
    }

    let array = [ ...state.value.data ];

    array =  array.map((elem) => {
        const object = { ...elem };

        delete object?.id;
        delete object?.delId;
        delete object?.quantityTypeValue;

        return object;
    });

    createWithExcelMutate(array);
}
</script>

<style lang="scss" scoped>
.manage {
    &__form {
        margin-bottom: 30px;
    }
    &__file {
        &-form {
            display: flex;
            flex-direction: column;
            gap: 30px;
        }
        &-head {
            display: flex;
            gap: 10px;
            @media (max-width: 480px) {
                flex-direction: column;
            }
        }
    }
}
</style>
<template>
    <section class="manage section-height shadowed" v-if="isShow">
        <div class="manage__inner section-padding">
            <ManageHead 
                title="addNewProductTitle" 
                :to="routes.PRODUCT.path"
            />
            <form class="manage__form form-manage" @submit.prevent="submitHandler">
                <template v-for="field in fields" :key="field.id">
                    <FormInput 
                        v-if="!field?.select"
                        v-model="state[field.model]"
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
                    :className="`form__submit ${v$?.quantityTypeId?.$errors?.[0]?.$message ? 'centered' : ''}`"
                >
                    {{ $t("formButton") }}
                </CustomButton>
            </form>
            <form class="manage__file-form" @submit.prevent="submitWithExcelFile">
                <div class="manage__file-head">
                    <FormFile
                        :width="240" 
                        accept=".xlsx"
                        @onChangFile="handleFileUpload"
                    >
                        {{ $t("fileLabel") }}
                    </FormFile>
                    <CustomButton
                        v-if="state.data.length"
                        :width="240" 
                        className="form__submit"
                        :disabled="status === 'pending'"
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
import * as XLSX from "xlsx";
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
    { id: 1, label: "productName", width: 70 },
    { id: 2, label: "quantityName", width: 20 }
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

const fields = ref([
    { 
        id: 1, 
        model: "fullname", 
        label: "nameProductsLabel", 
        placeholder: "nameProductsPlaceholder", 
        icon: "pen",
        errorKey: "fullname",
    },
    { 
        id: 2, 
        model: "quantityTypeId", 
        label: "qunatityTypesProductsLabel", 
        placeholder: "qunatityTypesProductsPlaceholder",
        errorKey: "quantityTypeId",
        options: quantityTypes,
        success: isSuccessQunatityTypes,
        loading: isLoadingQunatityTypes,
        select: true
    }
]);

const handleFileUpload = (value) => {
    const reader = new FileReader();

    reader.readAsArrayBuffer(value);

    reader.onload = (e) => {
        let data = [];
        const information = new Uint8Array(e.target.result);

        const workbook = XLSX.read(information, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        state.value.data = data.map((elem, index) => ({ 
            id: index, 
            delId: uuidv4(), 
            fullname: elem[1], 
            quantityTypeId: elem[2], 
            quantityTypeValue: getTypesIdValue(elem[2])
        })).slice(1);
    }
};

const deleteHandler = (idx) => {
    state.value.data = state.value.data.filter((elem) => elem.delId !== idx);
}

const { mutate: createMutate, status } = useMutation({
    onMutate: (body) => {
        body.quantityTypeId = body.quantityTypeId[0];
    },
    mutationFn: (body) => create("construction_material", body),
    onSuccess: (response) => {
        if (!response?.success) return;

        state.value = clearState(state.value);

        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["materialsList"] });

        router.push(routes.PRODUCT.path);

        setTimeout(() => toast.success(t("createToast")), 150);
    }
});

const { mutate: createWithExcelMutate } = useMutation({
    mutationFn: (body) => createWithExcel("construction_material", body),
    onSuccess: (response) => {
        if (!response?.success) return;

        state.value = clearState(state.value);

        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["materialsList"] });

        router.push(routes.PRODUCT.path);

        setTimeout(() => toast.success(t("createToast")), 150);
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
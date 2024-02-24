<template>
    <div class="application-form">
        <h4 class="application-form__title">
            {{ $t("appInfo") }}
        </h4>
        <div class="application-form__overlay form-manage">
            <FormSelect 
                v-for="select in selects"
                :key="select.id"
                v-model="formData[select.model]" 
                :width="500" 
                :options="select.options"
                :placeholder="select?.placeholder"
                :success="select.success"
                :loading="select.loading"
                :isMultiSelect="select?.multiple"
            >
                {{ $t(select.label) }}
            </FormSelect>
            <FormInput 
                v-for="input in inputs"
                :key="input.id"
                v-model="formData[input.model]"
                :width="500" 
                :placeholder="$t(input.placeholder)"
                :name="input.icon"
                :type="input?.type"
            >
                {{ $t(input.label) }}
            </FormInput>
            <CustomButton 
                className="form__submit"
                type="button"
                @click="addHandler"
            >
                {{ $t("addButtonForm") }}
            </CustomButton>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { 
    clearForm, 
    isFormDataEmpty, 
    getFirstValue 
} from "@/utils/secondary-functions.js";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";

const toast = useToast();
const { t } = useI18n();

const props = defineProps(["selects", "buildingBlockId", "isSubmit"]);

const emit = defineEmits(["onAddTable"]);

const formData = ref({
    floorId: [],
    costId: [],
    constructionMaterialId: [],
    count: "",
    price: ""
});

const valueBlock = computed(() => props.buildingBlockId);

const isSubmit = computed(() => props?.isSubmit);

watch(valueBlock, () => {
    if (!isSubmit.value) {
        formData.value.floorId = [];
    }
})

const inputs = ref([
    { 
        id: 1, 
        model: "count", 
        label: "countAppLabel", 
        placeholder: "countAppPlaceholder", 
        icon: "list",
        type: "text"
    },
    { 
        id: 2, 
        model: "price", 
        label: "priceAppLabel", 
        placeholder: "priceAppPlaceholder", 
        icon: "money",
        type: "text"
    }
]);

const addHandler = () => {
    const isEmpty = isFormDataEmpty(formData.value);

    if (!isEmpty) {
        toast.error(t("isEmptyModal"));
        return;
    }

    formData.value = getFirstValue(formData.value);

    emit("onAddTable", formData.value);

    formData.value = clearForm(formData.value);
}
</script>

<style lang="scss" scoped>
.application-form {
    margin-bottom: 30px;
    &__title {
        font-size: 20px;
        margin-bottom: 10px;
    }
}
</style>
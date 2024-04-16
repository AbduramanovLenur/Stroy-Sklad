<template>
    <div class="application-form">
        <h4 class="application-form__title">
            {{ $t("appInfo") }}
        </h4>
        <div class="application-form__overlay form-manage">
            <template v-for="subField in subFields" :key="subField.id">
                <FormInput 
                    v-if="!subField?.select"
                    v-model="formData[subField.model]"
                    :placeholder="$t(subField.placeholder)"
                    :name="subField.icon"
                    :type="subField?.type"
                >
                    <span>{{ $t(subField.label) }} <span v-if="subField?.quantityType">{{ quantityType }}</span></span>
                </FormInput>
                <FormSelect 
                    v-if="subField?.select"
                    v-model.trim="formData[subField.model]" 
                    :options="subField.options"
                    :placeholder="subField?.placeholder"
                    :success="subField.success"
                    :loading="subField.loading"
                    :isMultiSelect="subField?.multiple"
                >
                    {{ $t(subField.label) }}
                </FormSelect>
            </template>
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
import { clearForm, isFormDataEmpty } from "@/utils/secondary-functions.js"
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useToast } from "vue-toastification"

const toast = useToast();
const { t } = useI18n();

const props = defineProps({
    subFields: Array, 
    buildingBlockId: Array, 
    isSubmit: Boolean,
    quantityType: String
});

const emit = defineEmits(["onAddTable", "onGetQuantityType"]);

const formData = ref({
    floorId: [],
    costId: [],
    constructionMaterialId: [],
    count: "",
    // quantityTypeId: []
});

const valueMaterial = computed(() => formData.value.constructionMaterialId[0]);

watch(valueMaterial, (value) => {
    emit('onGetQuantityType', value);
}, { immediate: true });

const valueBlock = computed(() => props.buildingBlockId);

watch(valueBlock, () => {
    formData.value.floorId = [];
}, { immediate: true });

const addHandler = () => {
    const isEmpty = isFormDataEmpty(formData.value);

    if (!isEmpty) {
        toast.error(t("isEmptyModal"));
        return;
    }

    formData.value = {
        floorId: formData.value.floorId[0],
        costId: formData.value.costId[0],
        constructionMaterialId: formData.value.constructionMaterialId[0],
        count: formData.value.count,
        // quantityTypeId: formData.value.quantityTypeId[0]
    }

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
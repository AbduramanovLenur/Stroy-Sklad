<template>
    <div class="estimate-form">
        <h4 class="estimate-form__title">
            {{ $t("estimateInfo") }}
        </h4>
        <div class="estimate-form__overlay form-manage">
            <template v-for="subField in subFields" :key="subField.id">
                <FormInput 
                    v-if="!subField?.select"
                    v-model="formData[subField.model]"
                    :placeholder="$t(subField.placeholder)"
                    :name="subField.icon"
                    :type="subField?.type"
                >
                    {{ $t(subField.label) }}
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
import { ref, computed, watch } from "vue";
import { clearForm, isFormDataEmpty } from "@/utils/secondary-functions.js";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";

const toast = useToast();
const { t } = useI18n();

const props = defineProps({
    subFields: Array,
    blockId: Number
});

const emit = defineEmits(["onAddTable", "onChangeBlock"]);

const valueBlock = computed(() => props.blockId);

const formData = ref({
    buildingBlockId: valueBlock.value || "",
    floorId: [],
    costId: [],
    constructionMaterailIds: [],
    price: ""
});

watch(valueBlock, (value) => {
    formData.value.buildingBlockId = value;
    formData.value.floorId = [];
});

const addHandler = () => {
    const isEmpty = isFormDataEmpty(formData.value);

    if (!isEmpty && !formData.value.buildingBlockId) {
        formData.value.buildingBlockId = valueBlock.value;
    }

    if (!isEmpty) {
        toast.error(t("isEmptyModal"));
        return;
    }

    formData.value = { 
        buildingBlockId: formData.value.buildingBlockId,
        floorId: formData.value.floorId[0],
        costId: formData.value.costId[0],
        constructionMaterailIds: formData.value.constructionMaterailIds,
        price: parseInt(formData.value.price.replaceAll(' ', ''), 10)
    }

    emit("onAddTable", formData.value);

    formData.value = clearForm(formData.value, ["buildingBlockId"]);
}
</script>

<style lang="scss" scoped>
.estimate-form {
    margin-top: 30px;
    margin-bottom: 30px;
    &__title {
        font-size: 20px;
        margin-bottom: 10px;
    }
}
</style>
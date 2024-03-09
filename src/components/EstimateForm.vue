<template>
    <div class="estimate-form">
        <h4 class="estimate-form__title">
            {{ $t("estimateInfo") }}
        </h4>
        <div class="estimate-form__overlay form-manage">
            <FormSelect 
                v-for="select in selects"
                :key="select.id"
                v-model.trim="formData[select.model]" 
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
import { clearForm, isFormDataEmpty } from "@/utils/secondary-functions.js";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";

const toast = useToast();
const { t } = useI18n();

const props = defineProps(["selects", "blockId"]);

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

const inputs = ref([
    { 
        id: 1, 
        model: "price", 
        label: "priceEstimateLabel", 
        placeholder: "priceEstimatePlaceholder", 
        icon: "money"
    }
]);

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
        price: formData.value.price
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
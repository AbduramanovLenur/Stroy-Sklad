<template>
    <div class="label" :style="`max-width: ${width}px;`">
        <slot />
        <MultiSelect 
            ref="multiselectRef"
            @change="changeValue"
            :options="options" 
            :modelValue="modelValue"
            filter 
            optionLabel="name" 
            :optionValue="optionValue ? optionValue : 'id'"
            :placeholder="$t(placeholder)"
            :loading="loading"
            :disabled="loading || !options?.length"
        />
        <span 
            v-if="error" 
            class="error"
        >
            {{ textError }}
        </span>
    </div>
</template>

<script setup>
import { ref } from "vue";
import MultiSelect from "primevue/multiselect";

const multiselectRef = ref(null);

const emit = defineEmits(["update:modelValue"]);

const props = defineProps([
    "width", 
    "placeholder", 
    "options", 
    "error", 
    "textError", 
    "success", 
    "loading",
    "modelValue",
    "isMultiSelect",
    "optionValue"
]);

const changeValue = (event) => {
    const value = event.value;
    const options = [...value];

    if (options.length > 1 && !props.isMultiSelect) {
        options.shift();
    }

    emit('update:modelValue', options);

    multiselectRef.value.hide();
}
</script>

<style lang="scss" scoped>
.label {
    font-size: 18px;
    font-weight: 500;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
}
</style>
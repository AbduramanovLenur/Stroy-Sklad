<template>
    <div class="label" :style="`max-width: ${width ? `${width}px` : 'initial'};`">
        <slot />
        <MultiSelect 
            ref="multiselectRef"
            @change="changeValue"
            :options="options" 
            :modelValue="modelValue"
            filter 
            optionLabel="name" 
            optionValue="id"
            :placeholder="$t(placeholder)"
            :loading="loading"
            :disabled="loading || !options?.length || isDisabled"
            display="chip"
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
import MultiSelect from "primevue/multiselect"
import { ref } from "vue"

const multiselectRef = ref(null);

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
    width: Number, 
    placeholder: String, 
    options: Array, 
    error: Boolean, 
    textError: String, 
    success: Boolean, 
    loading: Boolean,
    modelValue: [String, Array, Number, Object],
    isMultiSelect: Boolean,
    isDisabled: Boolean
});

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
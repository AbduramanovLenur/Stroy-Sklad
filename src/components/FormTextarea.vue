<template>
    <label class="label" :style="`max-width: ${width}px;`">
        <slot />
        <textarea 
            class="textarea" 
            :type="type ? type : 'text'" 
            :placeholder="placeholder" 
            :value="modelValue" 
            @input="($event) => $emit('update:modelValue', $event.target.value)"
            :disabled="isDisabled"
        />
        <span 
            v-if="error" 
            class="error"
        >
            {{ textError }}
        </span>
    </label>
</template>

<script setup>
defineProps([
    "modelValue", 
    "width", 
    "name", 
    "placeholder", 
    "error", 
    "textError",
    "type",
    "isDisabled"
]);
</script>

<style lang="scss" scoped>
.label {
    font-size: 18px;
    font-weight: 500;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    
    @media (max-width: 480px) {
        font-size: 16px;
    }
}

.textarea {
    font-size: 16px;
    font-weight: 500;
    height: 150px;
    width: 100%;
    padding: 10px 20px;
    border-radius: 20px;
    border: none;
    -webkit-box-shadow: 0px 0px 27px -7px rgba(0, 0, 0, 0.2);
    -moz-box-shadow: 0px 0px 27px -7px rgba(0, 0, 0, 0.2);
    box-shadow: 0px 0px 27px -7px rgba(0, 0, 0, 0.2);
    @media (max-width: 480px) {
        font-size: 14px;
    }

    &::-webkit-scrollbar {
        width: 2px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: transparent;
    }
    &:disabled {
        background-color: var(--white);
    }
}
</style>
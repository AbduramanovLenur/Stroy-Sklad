<template>
    <label class="label" :style="`max-width: ${width}px;`">
        <slot />
        <span class="label-wrapper">
            <input 
                class="input" 
                type="text" 
                :placeholder="placeholder" 
                :value="modelValue" 
                @input="($event) => $emit('update:modelValue', $event.target.value)"
            >
            <span class="label-icon">
                <Icon :name="name" />
            </span>
        </span>
        <span 
            v-if="error" 
            class="error"
        >
            {{ textError }}
        </span>
    </label>
</template>

<script setup>
import Icon from "@/components/Icon.vue";

defineProps(["modelValue", "width", "name", "placeholder", "error", "textError"]);
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
    &-wrapper {
        position: relative;
    }
    &-icon {
        position: absolute;
        top: 60%;
        transform: translateY(-60%);
        left: 20px;
    }
}

.input {
    font-size: 16px;
    font-weight: 500;
    height: 50px;
    width: 100%;
    padding: 10px 50px;
    border-radius: 20px;
    border: none;
    @media (max-width: 480px) {
        font-size: 14px;
    }
}

.error {
    font-size: 13px;
    color: var(--red);
}
</style>
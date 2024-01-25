<template>
    <label class="label" :style="`max-width: ${width}px;`">
        <slot />
        <span class="select-wrapper">
            <select 
                class="select" 
                :value="modelValue" 
                @change="($event) => $emit('update:modelValue', $event.target.value)"
            >
                <option 
                    v-for="option in options" 
                    :key="option.id" 
                    :value="option.option" 
                    class="option"
                >
                    {{ option.option }}
                </option>
            </select>
            <div class="select-icon">
                <Icon name="down" />
            </div>
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

defineProps(["modelValue", "width", "placeholder", "options", "error", "textError"]);
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

.select {
    font-size: 16px;
    font-weight: 500;
    border-radius: 20px;
    border: none;
    height: 50px;
    padding: 5px 30px;
    width: 100%;
    @media (max-width: 480px) {
        font-size: 14px;
    }
    &-wrapper {
        position: relative;
    }
    &-icon {
        position: absolute;
        top: 60%;
        transform: translateY(-60%);
        right: 20px;
    }
}

.option {
    font-size: 18px;
    padding: 10px;
    border-radius: 20px;
}
</style>
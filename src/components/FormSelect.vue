<template>
    <label class="label" :style="`max-width: ${width}px;`">
        <slot />
        <select 
            class="select" 
            :value="modelValue" 
            @change="($event) => $emit('update:modelValue', $event.target.value)"
        >
            <option 
                :value="placeholder" 
                class="option" 
                disabled 
                hidden
            >
                {{ placeholder }}
            </option>
            <option 
                v-for="option in options" 
                :key="option.id" 
                :value="option.option" 
                class="option"
            >
                {{ option.option }}
            </option>
        </select>
    </label>
</template>

<script setup>
defineProps(["modelValue", "width", "placeholder", "options"]);
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
    @media (max-width: 480px) {
        font-size: 14px;
    }
}

.option {
    font-size: 18px;
    padding: 10px;
    border-radius: 20px;
}
</style>
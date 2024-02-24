<template>
    <label class="label" :style="`max-width: ${width}px;`">
        <slot />
        <span class="label-wrapper">
            <input 
                v-model="model"
                class="input" 
                :type="type ? type : 'text'" 
                :placeholder="placeholder" 
                :disabled="isDisabled"
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
defineProps([ 
    "width", 
    "name", 
    "placeholder", 
    "error", 
    "textError",
    "type",
    "isDisabled"
]);

const model = defineModel();
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
    -webkit-box-shadow: 0px 0px 18px 0px rgba(0, 0, 0, 0.2);
    -moz-box-shadow: 0px 0px 18px 0px rgba(0, 0, 0, 0.2);
    box-shadow: 0px 0px 18px 0px rgba(0, 0, 0, 0.2);
    @media (max-width: 480px) {
        font-size: 14px;
    }
    &:disabled {
        background-color: var(--white);
    }
}
</style>
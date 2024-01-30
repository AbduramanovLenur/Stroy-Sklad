<template>
    <form class="form" @submit.prevent="searchHandler">
        <input 
            v-model="search" 
            class="form-input" 
            type="text" 
            :placeholder="$t('companySearchPlaceholder')"
        >
        <button class="form-submit" type="submit">
            <Icon name="search" />
        </button>
    </form>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["onSearch"]);

const search = ref("");

const searchHandler = () => {
    emit("onSearch", search.value);
    search.value = "";
}
</script>

<style lang="scss" scoped>
.form {
    display: flex;
    align-items: center;
    max-width: 320px;
    width: 100%;
    height: 40px;
    margin-left: auto;

    @media (max-width: 1024px) {
        margin-left: initial;
        order: 3;
    }

    @media (max-width: 768px) {
        grid-column: span 2;
    }

    @media (max-width: 480px) {
        grid-column: initial;
        height: 35px;
    }

    &-input {
        padding: 10px;
        max-width: 280px;
        width: 100%;
        height: 100%;
        border-radius: 10px 0 0 10px;
        border: 1px solid var(--black);
        @media (max-width: 480px) {
            font-size: 14px;
        }
    }

    &-submit {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--black);
        max-width: 40px;
        width: 100%;
        height: 100%;
        border-radius: 0 10px 10px 0;
    }
}
</style>
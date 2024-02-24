<template>
    <div class="head-page shadowed">
        <Title>
            {{ $t(title) }}
        </Title>
        <FormSearch />
        <MyButton 
            v-if="isShowCreate"
            :to="to"
            icon="add-company"
            type="link"
            color="black"
        >
            {{ $t("addButton") }}
        </MyButton>
    </div>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        default: () => ""
    },
    to: {
        type: String,
        default: () => ""
    }, 
    isShowCreate: {
        type: Boolean,
        default: () => true
    }
});
</script>

<style lang="scss" scoped>
.head-page {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 20px;

    @media (max-width: 1024px) {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
        gap: 15px;
    }

    @media (max-width: 480px) {
        grid-template-columns: repeat(1, 1fr);
    }
}
</style>
<template>
    <div class="manage-head">
        <Title>
            {{ $t(title) }}
        </Title>
        <MyButton :to="to" icon="back">
            {{ $t("backButton") }}
        </MyButton>
    </div>
</template>

<script setup>
defineProps(["title", "to"]);
</script>

<style lang="scss" scoped>
.manage-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;

    @media (max-width: 480px) {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>
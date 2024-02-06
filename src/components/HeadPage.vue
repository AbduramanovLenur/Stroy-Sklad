<template>
    <div class="head-page shadowed">
        <Title>
            {{ $t(title) }}
        </Title>
        <FormSearch 
            @onSearch="($event) => $emit('onSearch', $event)" 
        />
        <AddButton 
            @onOpenFormModal="() => $emit('onOpenFormModal')" 
            :to="to"
        />
    </div>
</template>

<script setup>
defineProps(["title", "to"]);
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
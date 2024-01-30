<template>
    <section class="object">
        <div class="object__inner">
            <div class="object__head">
                <Title>
                    {{ $t("objectTitle") }}
                </Title>
                <!-- <FormSearch 
                    @onSearch="($event) => companyForm.search = $event" 
                />
                <AddButton
                    @onOpenFormModal="createNewCompanyHandler"
                /> -->
            </div>
        </div>
    </section>
</template>

<script setup>
import Title from "@/components/Title.vue";
</script>

<style lang="scss" scoped>

</style>
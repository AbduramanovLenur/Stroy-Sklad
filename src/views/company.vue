<template>
    <section class="company">
        <div class="company__inner">
            <div class="company__head">
                <Title>
                    {{ $t("comapnyTitle") }}
                </Title>
                <Form @onSearchHandler="searchHandler" />
                <AddButton to="/add-company" />
            </div>
            <Table :headers="headers" :table="table" />
        </div>
    </section>
</template>

<script setup>
import { ref } from "vue";
import Title from "@/components/Title.vue";
import Form from "@/components/Form.vue";
import AddButton from "@/components/AddButton.vue";
import Table from "@/components/Table.vue";

const searchHandler = (search) => {
    console.log(search);
}

const headers = ref([
    { id: 1, label: "organizationName" },
    { id: 2, label: "organizationInn" },
    { id: 3, label: "organizationRegion" },
    { id: 4, label: "organizationDistrict" },
    { id: 5, label: "organizationAddress" },
    { id: 6, label: "organizationPhone" },
    { id: 7, label: "organizationDirector" },
    { id: 8, label: "organizationEdit" },
]);

const table = ref([
    { id: 1, fullName: "Microsoft Academy", Inn: "123456789", region: "Навоиская область", district: "Навои", address: "Ибн-Сино 18", phone: "+998999999999", director: "Иванов Иван Иванович" },
    { id: 2, fullName: "Admin qwerty company", Inn: "123456789", region: "Навоиская область", district: "Навои", address: "Толстово кирпич 18", phone: "+998999999999", director: "Иванов Иван Иванович" }
]);
</script>

<style lang="scss" scoped>
.company {
    &__inner {
        padding: 20px;
    }

    &__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;

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
}
</style>
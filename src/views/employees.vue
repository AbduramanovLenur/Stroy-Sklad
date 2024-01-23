<template>
    <section class="employees">
        <div class="employees__inner">
            <div class="employees__head">
                <Title>
                    {{ $t("employeesTitle") }}
                </Title>
                <FormSearch @onSearch="searchHandler" />
                <AddButton
                    @onOpenFormModal="createNewEmployeesHandler"
                />
            </div>
            <Table 
                :headers="headers" 
                :table="table" 
                @onAction="actionEmployeesHandler"
            />
        </div>
        <FormModal
            :title="titleModal"
        />
    </section>
</template>

<script setup>
import { ref } from "vue";
import { useModalsStore } from "@/store/modalsStore.js";
import Title from "@/components/Title.vue";
import FormSearch from "@/components/FormSearch.vue";
import AddButton from "@/components/AddButton.vue";
import Table from "@/components/Table.vue";
import FormModal from "@/components/FormModal.vue";

const modalsStore = useModalsStore();
const { toggleIsOpenModalForm } = modalsStore;

const titleModal = ref("");

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
    { 
        id: 1, 
        fullName: "Microsoft Academy", 
        Inn: "123456789", 
        region: "Навоиская область", 
        district: "Навои", 
        address: "Ибн-Сино 18", 
        phone: "+998999999999", 
        director: "Иванов Иван Иванович" 
    },
    { 
        id: 2, 
        fullName: "Admin qwerty company", 
        Inn: "123456789", 
        region: "Навоиская область", 
        district: "Навои", 
        address: "Толстово кирпич 18", 
        phone: "+998999999999", 
        director: "Иванов Иван Иванович" 
    },
    { 
        id: 3, 
        fullName: "Microsoft Academy", 
        Inn: "123456789", 
        region: "Навоиская область", 
        district: "Навои", 
        address: "Ибн-Сино 18", 
        phone: "+998999999999", 
        director: "Иванов Иван Иванович" 
    },
    { 
        id: 4, 
        fullName: "Admin qwerty company", 
        Inn: "123456789", 
        region: "Навоиская область", 
        district: "Навои", 
        address: "Толстово кирпич 18", 
        phone: "+998999999999", 
        director: "Иванов Иван Иванович" 
    },
    { 
        id: 5, 
        fullName: "Microsoft Academy", 
        Inn: "123456789", 
        region: "Навоиская область", 
        district: "Навои", 
        address: "Ибн-Сино 18", 
        phone: "+998999999999", 
        director: "Иванов Иван Иванович" 
    },
    { 
        id: 6, 
        fullName: "Admin qwerty company", 
        Inn: "123456789", 
        region: "Навоиская область", 
        district: "Навои", 
        address: "Толстово кирпич 18", 
        phone: "+998999999999", 
        director: "Иванов Иван Иванович" 
    }
]);

const searchHandler = (search) => {
    console.log(search);
}

const createNewEmployeesHandler = () => {
    titleModal.value = "addNewEmployees";
    toggleIsOpenModalForm();
}

const actionEmployeesHandler = ({ action, id }) => {
    if (action === 'delete') {
        console.log("delete");
        console.log(id);
        return;
    }

    console.log('edit');
    console.log(id);
    titleModal.value = "editEmployees";
    toggleIsOpenModalForm();
}
</script>

<style lang="scss" scoped>
.employees {
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
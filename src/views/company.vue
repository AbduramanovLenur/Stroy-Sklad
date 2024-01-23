<template>
    <section class="company">
        <div class="company__inner">
            <div class="company__head">
                <Title>
                    {{ $t("comapnyTitle") }}
                </Title>
                <FormSearch @onSearch="searchHandler" />
                <AddButton
                    @onOpenFormModal="createNewCompanyHandler"
                />
            </div>
            <Table 
                :headers="headers" 
                :table="table" 
                @onAction="actionOrganizationHandler"
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

const createNewCompanyHandler = () => {
    titleModal.value = "addNewCompany";
    toggleIsOpenModalForm();
}

const actionOrganizationHandler = ({ action, id }) => {
    if (action === 'delete') {
        console.log("delete");
        console.log(id);
        return;
    }

    console.log('edit');
    console.log(id);
    titleModal.value = "editCompany";
    toggleIsOpenModalForm();
}

// const editOrganizationHandler = (idx) => {

// }
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
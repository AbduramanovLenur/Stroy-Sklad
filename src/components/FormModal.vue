<template>
    <div :class="`form-modal ${isOpenModalForm ? 'is-active' : ''}`" @click="toggleIsOpenModalForm">
        <div class="form-modal__overlay" @click.stop>
            <h2 class="form-modal__title">
                {{ $t(title) }}
            </h2>
            <form class="form-modal__form" @submit.prevent>
                <FormInput 
                    v-for="input in inputs"
                    :key="input.id"
                    :width="500" 
                    :placeholder="$t(input.placeholder)"
                    :name="input.icon"
                    v-model="formData[input.model]"
                >
                    {{ $t(input.label) }}
                </FormInput>
                <FormSelect 
                    :width="500" 
                    v-model="formData.regionOrganization" 
                    :options="regionSelect" 
                    placeholder="Region..."
                >
                    {{ $t("regionOrganizationLabel") }}
                </FormSelect>
                <FormSelect 
                    :width="500" 
                    v-model="formData.districtOrganization" 
                    :options="regionSelect" 
                    placeholder="Tuman..."
                >
                    {{ $t("districtOrganizationLabel") }}
                </FormSelect>
                <CustomButton className="form-modal__submit">
                    {{ $t("formButton") }}
                </CustomButton>
            </form>
            <div class="form-modal__close" @click="toggleIsOpenModalForm">
                <Icon name="close" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useModalsStore } from "@/store/modalsStore.js";
import { storeToRefs } from "pinia";
import FormInput from "@/components/FormInput.vue";
import FormSelect from "@/components/FormSelect.vue";
import Icon from "@/components/Icon.vue";
import CustomButton from "@/components/CustomButton.vue";

defineProps(["title"]);

const modalsStore = useModalsStore();
const { toggleIsOpenModalForm } = modalsStore;
const { isOpenModalForm } = storeToRefs(modalsStore);

const formData = ref({
    nameOrganization: "",
    tinOrganization: "",
    addressOrganization: "",
    phoneOrganization: "",
    directorOrganization: "",
    regionOrganization: "Region...",
    districtOrganization: "Tuman..."
});

const inputs = ref([
    { id: 1, model: "nameOrganization", label: "nameOrganizationLabel", placeholder: "nameOrganizationPlaceholder", icon: "input-company" },
    { id: 2, model: "tinOrganization", label: "innOrganizationLabel", placeholder: "innOrganizationPlaceholder", icon: "tin" },
    { id: 3, model: "addressOrganization", label: "addressOrganizationLabel", placeholder: "addressOrganizationPlaceholder", icon: "address" },
    { id: 4, model: "phoneOrganization", label: "phoneOrganizationLabel", placeholder: "phoneOrganizationPlaceholder", icon: "phone" },
    { id: 5, model: "directorOrganization", label: "directorOrganizationLabel", placeholder: "directorOrganizationPlaceholder", icon: "person" }
]);

const regionSelect = ref([
    { id: 1, option: "Навои обл." },
    { id: 2, option: "Самарканд обл." },
    { id: 3, option: "Ташкент обл." }
]);

const discrictSelect = ref([
    { id: 1, option: "Навои" },
    { id: 2, option: "Самарканд" },
    { id: 3, option: "Ташкент" }
])
</script>

<style lang="scss" scoped>
.form-modal {
    display: flex;
    justify-content: flex-end;
    position: fixed;
    top: 0;
    right: -100%;
    width: 100%;
    height: 100%;
    z-index: 1002;
    transition: 0.5s;
    &.is-active {
        right: 0;
    }
    &__overlay {
        position: relative;
        max-width: 50%;
        width: 100%;
        height: 100%;
        background-color: rgb(241, 237, 237);
        padding: 100px 40px;
        -webkit-box-shadow: 0px 0px 41px 0px rgba(0, 0, 0, 0.2);
        -moz-box-shadow: 0px 0px 41px 0px rgba(0, 0, 0, 0.2);
        box-shadow: 0px 0px 41px 0px rgba(0, 0, 0, 0.2);
        overflow-y: auto;
        
        @media (max-width: 1024px) {
            max-width: 65%;
        }

        @media (max-width: 768px) {
            max-width: 80%;
        }

        @media (max-width: 480px) {
            max-width: 100%;
            padding: 70px 20px;
        }

        &::-webkit-scrollbar {
            background-color: transparent;
            width: 1px;
        }
    }
    &__title {
        font-size: 38px;
        margin-bottom: 30px;
        @media (max-width: 768px) {
            font-size: 32px;
            margin-bottom: 20px;
        }
        @media (max-width: 480px) {
            font-size: 28px;
            margin-bottom: 15px;
        }
        @media (max-width: 360px) {
            font-size: 24px;
        }
    }
    &__form {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        @media (max-width: 1024px) {
            gap: 10px;
        }
        @media (max-width: 768px) {
            grid-template-columns: repeat(1, 1fr);
            gap: 20px;
        }
    }
    &__submit {
        margin-top: auto;
    }
    &__close {
        position: absolute;
        top: 20px;
        left: 20px;
    }
}
</style>
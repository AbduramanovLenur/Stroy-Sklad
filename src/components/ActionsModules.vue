<template>
    <ul class="modules">
        <li class="modules__action" v-for="item in actions" :key="item.id">
            <div class="modules__action-box">
                <h4 class="modules__action-title">
                    {{ item.fullName }}
                </h4>
                <ul class="modules__action-list">
                    <li 
                        class="modules__action-item"                                 
                        v-for="elem in item.modules" 
                        :key="elem.id"
                    >
                        <label class="modules__action-label">
                            <input 
                                v-model="model"
                                type="checkbox" 
                                :value="elem.id" 
                            >
                            {{ elem.fullName }}
                        </label>
                    </li>
                </ul>
            </div>
        </li>
    </ul>
</template>

<script setup>
defineProps(["actions"]);

const model = defineModel();
</script>

<style lang="scss" scoped>
.modules {
    gap: 20px;
    grid-column: 1/4;
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    &__action {
        &-box {
            display: flex;
            flex-direction: column;
            gap: 10px;
            webkit-box-shadow: 0px 0px 15px -1px rgba(0, 0, 0, 0.2);
            -moz-box-shadow: 0px 0px 15px -1px rgba(0, 0, 0, 0.2);
            box-shadow: 0px 0px 15px -1px rgba(0, 0, 0, 0.2);
            border-radius: 20px;
            padding: 20px 30px;
            // max-width: 495px;
            // width: 100%;
            @media (max-width: 1350px) {
                padding: 15px;
            }
        }
        &-title {
            display: inline-flex;
            font-size: 20px;
            font-weight: 500;
            @media (max-width: 1350px) {
                font-size: 18px;
            }
            @media (max-width: 480px) {
                font-size: 16px;
            }
        }
        &-list {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 15px;
            // width: 100%;
            @media (max-width: 1350px) {
                gap: 10px;
            }
            @media (max-width: 1024px) {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
            }
            @media (max-width: 864px) {
                grid-template-columns: repeat(3, 1fr);
            }
            @media (max-width: 768px) {
                justify-content: flex-start;
            }
            @media (max-width: 480px) {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
            }
        }
        &-label {
            font-size: 18px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 7px;
            cursor: pointer;
            @media (max-width: 1350px) {
                font-size: 16px;
            }
            @media (max-width: 480px) {
                font-size: 14px;
            }
            input {
                width: 15px;
                height: 15px;
                cursor: pointer;
            }
        }
    }
    &__submit {
        grid-column: 1/2;
    }
}
</style>
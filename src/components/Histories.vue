<template>
    <div class="histories">
        <div class="histories__label">
            {{ $t("historiesLabel") }}
        </div>
        <ul class="histories__list">
            <li 
                v-for="history in histories"
                :key="history.id"
                class="histories__item"
            >
                <div :class="`histories__box ${ history?.statusId === 1 ? 'created' : history?.statusId === 7 ? 'accepted' : history?.statusId === 20 ? 'expected' : history?.statusId === 15 ? 'refused' : '' }`">
                    <div class="histories__head">
                        <div class="histories__name">
                            {{ history?.userName }}
                        </div>
                        <!-- <div class="histories__role-name">
                            {{ history?.role }}
                        </div> -->
                        <div class="histories__divider">
                            -
                        </div>
                        <div class="histories__status">
                            {{ history?.status }}
                        </div>
                    </div>
                    <div class="histories__date">
                        {{ date(history?.createdDate) }}
                    </div>
                    <div class="histories__comment">
                        {{ history?.comment }}
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { computed } from "vue";
defineProps(["histories"]);

const date = computed(() => {
    return (value) => {
        let dateObject = new Date(value);
        let date = dateObject.toISOString().split('T')[0];
        let time = dateObject.toISOString().split('T')[1].split('.')[0];

        return `${date} ${time}`;
    };
});
</script>

<style lang="scss" scoped>
.histories {
    margin-top: 30px;
    &__list {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    &__label {
        font-size: 20px;
        font-weight: 500;
        margin-bottom: 10px;
    }
    &__item {
        max-width: max-content;
    }
    &__box {
        position: relative;
        font-weight: 700;
        padding: 5px 25px;
        border-radius: 20px;
        margin-left: 20px;
        @media (max-width: 480px) {
            font-size: 14px;
            padding: 10px;
        }
        &::after {
            content: "";
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            left: -20px;
            width: 10px;
            height: 10px;
            background-color: var(--black);
            border-radius: 50%;
        }
        // &.created {
        //     background-color: var(--blue);
        //     color: var(--white);
        // }
        // &.accepted {
        //     background-color: var(--green);
        //     color: var(--white);
        // }
        // &.expected {
        //     background-color: var(--yellow);
        //     color: var(--red);
        // }
        // &.refused {
        //     background-color: var(--red);
        //     color: var(--white);
        // }
    }
    &__head {
        display: flex;
        align-items: center;
        gap: 10px;
        @media (max-width: 900px) {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
        }
    }
    &__divider {
        @media (max-width: 900px) {
            display: none;
        }
    }
    &__comment {
        max-width: 800px;
        white-space: pre-wrap;
    }
}
</style>
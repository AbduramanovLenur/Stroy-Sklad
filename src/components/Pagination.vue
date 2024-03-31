<template>
    <div class="pagination shadowed" v-if="isSucces && !!count">
        <vue-awesome-paginate
            v-model="page"
            :total-items="count"
            :items-per-page="+limit"
            :max-pages-shown="2"
            :on-click="(page) => setPagePagination(page)"
        />
        <select 
            class="pagination-select" 
            :value="limit"
            @change="($event) => onChangeLimit($event.target.value)"
        >
            <option 
                v-for="option in options" 
                :key="option.id" 
                :value="option.number"
            >
                {{ option.number }}
            </option>
        </select>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useTableStore } from "@/store/tableStore";

defineProps({
    count: Number, 
    isSucces: Boolean
});

const options = ref([
    { id: 1, number: 10 },
    { id: 2, number: 20 },
    { id: 3, number: 50 },
]);

const tableStore = useTableStore();
const { setPagePagination, setLimitPagination } = tableStore;
const { page, limit } = storeToRefs(tableStore);

onMounted(() => {
    setPagePagination(1);
    setLimitPagination(10);
});

const onChangeLimit = (limit) => {
    setLimitPagination(limit);
    setPagePagination(1);
}
</script>

<style lang="scss" scoped>
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
    @media (max-width: 480px) {
        flex-direction: column;
        gap: 20px;
    }
    &-select {
        text-align: center;
        margin-left: 20px;
        -webkit-box-shadow: 0px 0px 18px 0px rgba(0, 0, 0, 0.2);
        -moz-box-shadow: 0px 0px 18px 0px rgba(0, 0, 0, 0.2);
        box-shadow: 0px 0px 18px 0px rgba(0, 0, 0, 0.2);
        padding: 10px;
        border-radius: 10px;
        background-color: var(--white);

        @media (max-width: 480px) {
            font-size: 14px;
            padding: 8px;
            margin-left: initial;
        }
    }
}
</style>
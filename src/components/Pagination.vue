<template>
    <div class="pagination" v-if="isSucces && isEmpty">
        <vue-awesome-paginate
            v-model="pageLocal"
            :total-items="count"
            :items-per-page="limit"
            :max-pages-shown="5"
        />
        <select 
            v-model="limitLocal"
            class="pagination-select" 
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
import { ref, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useTableStore } from "@/store/tableStore";

defineProps([
    "limit",
    "count", 
    "isSucces", 
    "isEmpty", 
    "modelValue"
]);

const tableStore = useTableStore();
const { setPagePagination, setLimitPagination } = tableStore;
const { page, limit } = storeToRefs(tableStore);

const pageLocal = ref(page.value);
const limitLocal = ref(limit.value);

onMounted(() => {
    setPagePagination(1);
    setLimitPagination(10);
    pageLocal.value = 1;
    limitLocal.value = 10;
});

const options = ref([
    { id: 1, number: 10 },
    { id: 1, number: 20 },
    { id: 1, number: 50 },
]);

watch(pageLocal, (value) => {
    setPagePagination(value);
});

watch(limitLocal, (value) => {
    setLimitPagination(value);
    setPagePagination(1);
    pageLocal.value = 1;
});
</script>

<style lang="scss" scoped>
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
    &-select {
        margin-left: 20px;
        -webkit-box-shadow: 0px 0px 18px 0px rgba(0, 0, 0, 0.2);
        -moz-box-shadow: 0px 0px 18px 0px rgba(0, 0, 0, 0.2);
        box-shadow: 0px 0px 18px 0px rgba(0, 0, 0, 0.2);
        padding: 10px;
        border-radius: 10px;
    }
}
</style>
<template>
    <section class="products section-height">
        <div class="products__inner section-padding">
            <HeadPage 
                title="productsTitle" 
                :to="routes.CREATE_PRODUCTS.path"
                @onSearch="($event) => setSearchValue($event)"
            />
            <div class="shadowed">
                <Table 
                    v-if="isSuccessProducts && products.length"
                    :headers="headers" 
                    :table="products"
                    :to="routes.UPDATE_PRODUCTS.name"
                    @onActionDelete="deleteHandler"
                />
                <Spinner v-if="isLoadingProducts" />
                <div 
                    v-if="(isSuccessProducts && !products.length) || isError" 
                    class="empty-table"
                >
                    {{ $t("emptyTableTitle") }}
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useTableStore } from "@/store/tableStore";
import { refDebounced } from "@vueuse/core";
import { useQueryClient, useQuery, useMutation } from "@tanstack/vue-query";
import { getList, deleteWithId } from "@/services/crud.services.js";
import { routes } from "@/utils/routes.js";

const queryClient = useQueryClient();

const tableStore = useTableStore();
const { setSearchValue } = tableStore;
const { page, limit, search } = storeToRefs(tableStore);

onMounted(() => {
    setSearchValue("");
});

const productsId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "productsName", width: 725 },
    { id: 4, label: "productsState", width: 365 },
    { id: 5, label: "productsAction", width: 440 }
]);

const {
    data: products,
    isLoading: isLoadingProducts,
    isSuccess: isSuccessProducts,
    isError
} = await useQuery({
    queryKey: ["products", { page, limit, debouncedSearch }],
    queryFn: () => getList("construction_material", page.value, limit.value, debouncedSearch.value),
    select: (data) => {
        return data.map((elem) => {
            const product = {
                ...elem
            }

            delete product.organizationName;

            return product;
        })
    }
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("construction_material", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["productsById", productsId] });
    }
});

const deleteHandler = async (idx) => {
    productsId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped></style>
<template>
    <section class="products">
        <div class="products__inner section-padding">
            <HeadPage 
                title="productsTitle" 
                :to="routes.CREATE_PRODUCTS.path"
                @onSearch="($event) => setSearchValue($event)"
            />
            <Table 
                v-if="isSuccessProducts && products?.count"
                :headers="headers" 
                :table="products?.constructionMaterial"
                :to="routes.UPDATE_PRODUCTS.name"
                :options="{ page, limit }"
                @onActionDelete="deleteHandler"
            />
            <Pagination
                :count="products?.count"
                :isSucces="isSuccessProducts"
            />
            <Spinner v-if="isLoadingProducts" />
            <div 
                v-if="(isSuccessProducts && !products?.count) || isError" 
                class="empty-table shadowed"
            >
                {{ $t("emptyTableTitle") }}
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useTableStore } from "@/store/tableStore";
import { refDebounced } from "@vueuse/core";
import { useQueryClient, useQuery, useMutation } from "@tanstack/vue-query";
import { getList, deleteWithId } from "@/services/crud.services.js";
import { routes } from "@/utils/routes.js";

const queryClient = useQueryClient();

const tableStore = useTableStore();
const { setSearchValue, setPagePagination } = tableStore;
const { page, limit, search } = storeToRefs(tableStore);

const organizationId = ref(localStorage.getItem("organizationId"));

onMounted(() => {
    setSearchValue("");
});

watch(search, () => {
    setPagePagination(1);
});

const productsId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "productsName", width: 725 },
    { id: 4, label: "productsState" },
    { id: 5, label: "productsAction" }
]);

const {
    data: products,
    isLoading: isLoadingProducts,
    isSuccess: isSuccessProducts,
    isError
} = await useQuery({
    queryKey: ["products", { page, limit, debouncedSearch, organizationId }],
    queryFn: () => getList("construction_material", page.value, limit.value, debouncedSearch.value, { organizationId: organizationId.value }),
    select: (data) => {
        let productsList = [...data?.constructionMaterial];

        productsList = productsList.map((elem) => {
            const product = {
                ...elem
            }

            delete product.organizationName;

            return product;
        })

        return {
            constructionMaterial: productsList,
            count: data?.count
        }
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
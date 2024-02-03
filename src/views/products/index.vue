<template>
    <section class="products section-height">
        <div class="products__inner section-padding">
            <HeadPage 
                title="productsTitle" 
                :to="routes.CREATE_PRODUCTS.path"
                @onSearch="($event) => search = $event"
            />
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
    </section>
</template>

<script setup>
import { ref } from "vue";
import { useQueryClient, useQuery, useMutation } from "@tanstack/vue-query";
import { getList, deleteWithId } from "@/services/crud.services.js";
import { routes } from "@/utils/routes.js";

const queryClient = useQueryClient();

const search = ref("");
const productsId = ref("");

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
    queryKey: ["products"],
    queryFn: () => getList("construction_material"),
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
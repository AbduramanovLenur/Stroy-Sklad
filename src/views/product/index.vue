<template>
    <section class="products" v-if="isShowList">
        <div class="products__inner section-padding">
            <HeadPage 
                title="productsTitle" 
                :to="routes.CREATE_PRODUCT.path"                
                :isShowCreate="user?.user?.modules?.includes(actionModules.PRODUCT.CREATE)"
            />
            <Table 
                v-if="isSuccessProducts && products?.count"
                :headers="headers" 
                :table="products?.constructionMaterial"
                :to="routes.UPDATE_PRODUCT.name"
                :options="{ page, limit }"
                :isShowUpdate="user?.user?.modules?.includes(actionModules.PRODUCT.UPDATE)"
                :isShowDelete="user?.user?.modules?.includes(actionModules.PRODUCT.DELETE)"
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
import { ref, watch, onMounted, computed } from "vue";
import { storeToRefs } from "pinia";
import { useTableStore } from "@/store/tableStore";
import { useUserStore } from "@/store/userStore";
import { refDebounced } from "@vueuse/core";
import { 
    useQueryClient, 
    useQuery, 
    useMutation 
} from "@tanstack/vue-query";
import { getList, deleteWithId } from "@/services/crud.services.js";
import { routes } from "@/utils/routes.js";
import { actionModules } from "@/utils/action-modules.js";

const queryClient = useQueryClient();

const tableStore = useTableStore();
const { page, limit, search } = storeToRefs(tableStore);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShowList = computed(() => !!user?.value.user?.modules?.includes(actionModules.PRODUCT.READ));

const productsId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "productsName", width: 1030 }
]);

const {
    data: products,
    isLoading: isLoadingProducts,
    isSuccess: isSuccessProducts,
    isError
} = await useQuery({
    queryKey: ["products", { page, limit, debouncedSearch, organizationId: user.value.user.organizationId }],
    queryFn: () => getList("construction_material", page.value, limit.value, debouncedSearch.value),
    select: (data) => {
        let productsList = [...data?.constructionMaterial];

        productsList = productsList.map((elem) => {
            const product = {
                ...elem,
                material: elem.fullName
            }

            delete product.fullName;
            delete product.quantityType;

            return product;
        })

        return {
            constructionMaterial: productsList,
            count: data?.count
        }
    },
    enabled: isShowList
});

const { mutate: mutateDelete } = useMutation({
    mutationFn: (idx) => deleteWithId("construction_material", idx),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["productsById", productsId] });
        queryClient.invalidateQueries({ queryKey: ["materialsList"] });
    }
});

const deleteHandler = async (idx) => {
    productsId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped></style>
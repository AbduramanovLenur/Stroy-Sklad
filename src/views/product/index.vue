<template>
    <section class="products" v-if="isShowList">
        <div class="products__inner section-padding">
            <HeadPage 
                title="productsTitle" 
                :to="routes.CREATE_PRODUCT.path"                
                :isShowCreate="user?.user?.modules?.includes(actionModules.PRODUCT.CREATE)"
            >
                {{ $t("addButton") }}
            </HeadPage>
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
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useTableStore } from "@/store/tableStore";
import { useUserStore } from "@/store/userStore";
import { refDebounced } from "@vueuse/core";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { 
    useQueryClient, 
    useQuery, 
    useMutation 
} from "@tanstack/vue-query";
import { getList, deleteWithId } from "@/services/crud.services.js";
import { routes } from "@/utils/routes.js";
import { actionModules } from "@/utils/action-modules.js";

const queryClient = useQueryClient();

const toast = useToast();
const { t } = useI18n();

const tableStore = useTableStore();
const { page, limit, search } = storeToRefs(tableStore);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isShowList = computed(() => !!user?.value.user?.modules?.includes(actionModules.PRODUCT.READ));

const productId = ref("");

const debouncedSearch = refDebounced(search, 500);

const headers = ref([
    { id: 1, label: "productsName", width: 50 },
    { id: 2, label: "productsTypeName", width: 20 }
]);

const {
    data: products,
    isLoading: isLoadingProducts,
    isSuccess: isSuccessProducts,
    isError
} = await useQuery({
    queryKey: ["products", { 
        page, 
        limit, 
        debouncedSearch, 
        organizationId: user.value.user.organizationId, 
        name: user.value.user.fullName 
    }],
    queryFn: () => getList("construction_material", page.value, limit.value, debouncedSearch.value),
    select: (data) => {
        let productsList = [...data?.constructionMaterial];

        productsList = productsList.map((elem) => {
            const product = {
                ...elem,
                material: elem.fullName
            }

            delete product.fullName;

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
    onSuccess: (response) => {
        if (!response?.success) return;

        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["productById", productId.value.toString()] });
        queryClient.invalidateQueries({ queryKey: ["materialsList"] });

        setTimeout(() => toast.success(t("deleteToast")), 150);
    }
});

const deleteHandler = async (idx) => {
    productId.value = idx;
    mutateDelete(idx);
}
</script>

<style lang="scss" scoped></style>
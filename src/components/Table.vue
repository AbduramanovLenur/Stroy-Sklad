<template>
    <div class="table" bordercolor="#000">
        <table class="table-wrapper">
            <tr class="table-line">
                <th class="table-title" align="center">
                    №
                </th>
                <th class="table-title" align="center" v-for="title in headers" :key="title.id">
                    {{ $t(title.label) }}
                </th>
            </tr>
            <tr class="table-line" v-for="info in table" :key="info.id">
                <td class="table-info" align="center">
                    {{ info.id }}
                </td>
                <td class="table-info" align="center">
                    {{ info.fullName }}
                </td>
                <td class="table-info" align="center">
                    {{ info.Inn }}
                </td>
                <td class="table-info" align="center">
                    {{ info.region }}
                </td>
                <td class="table-info" align="center">
                    {{ info.district }}
                </td>
                <td class="table-info" align="center">
                    {{ info.address }}
                </td>
                <td class="table-info" align="center">
                    {{ info.phone }}
                </td>
                <td class="table-info" align="center">
                    {{ info.director }}
                </td>
                <td class="table-info" align="center">
                    <div 
                        class="table-edit"
                        @click="() => $emit('onAction', { action: 'edit', id: info.id })"
                    >
                        <Icon name="edit" />
                    </div>
                    <div 
                        class="table-delete" 
                        @click="() => $emit('onAction', { action: 'delete', id: info.id })"
                    >
                        <Icon name="delete" />
                    </div>
                </td>
            </tr>
        </table>
    </div>
</template>

<script setup>
import Icon from "@/components/Icon.vue";
defineProps(["headers", "table"]);
</script>

<style lang="scss" scoped>
.table {
    overflow-x: auto;
    width: 100%;
    margin-top: 30px;

    &-wrapper {
        border-collapse: collapse;
        border: none;
        width: 100%;
        overflow-x: auto;
    }

    &-line {
        &:nth-child(odd) {
            background-color: rgb(240, 229, 229);
        }
    }

    &-title {
        font-size: 18px;
        font-weight: 500;
        text-transform: uppercase;
        padding: 25px 10px;
        background-color: #00ffff;
    }

    &-info {
        font-size: 16px;
        font-weight: 400;
        padding: 15px 10px;
        &:first-child {
            font-weight: 600;
        }
        &:last-child {
            display: flex;
            justify-content: center;
            gap: 20px;
        }
    }
}

th,
td {
    white-space: nowrap;

    // &:nth-child(1) {
    //     width: 50px;
    // }

    // &:nth-child(2) {
    //     width: 295px;
    // }

    // &:nth-child(3) {
    //     width: 115px;
    // }

    // &:nth-child(4) {
    //     width: 200px;
    // }

    // &:nth-child(5) {
    //     width: 90px;
    // }

    // &:nth-child(6) {
    //     width: 200px;
    // }

    // &:nth-child(7) {
    //     width: 155px;
    // }

    // &:nth-child(8) {
    //     width: 235px;
    // }

    // &:nth-child(9) {
    //     width: 245px;
    // }
}
tr {
    &:last-child {
        border-bottom: none;
    }
}
</style>
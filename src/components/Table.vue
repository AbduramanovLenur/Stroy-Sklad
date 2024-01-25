<template>
    <div class="table" bordercolor="#000">
        <table class="table-wrapper">
            <tr class="table-line">
                <th class="table-title" align="center" style="width: 55px;">
                    №
                </th>
                <th 
                    class="table-title" 
                    align="center" 
                    v-for="title in headers" 
                    :key="title.id" 
                    :style="`width: ${title.width}px;`"
                >
                    {{ $t(title.label) }}
                </th>
            </tr>
            <tr class="table-line" v-for="info in table" :key="info.id">
                <td v-if="info.id" class="table-info" align="center">
                    {{ info.id }}
                </td>
                <td v-if="info.fullname" class="table-info" align="center">
                    {{ info.fullname }}
                </td>
                <!-- <td v-if="info.organization" class="table-info" align="center">
                    {{ info.organization }}
                </td> -->
                <!-- <td v-if="info.phoneEmployees" class="table-info" align="center">
                    {{ info.phoneEmployees }}
                </td> -->
                <td v-if="info.role" class="table-info" align="center">
                    {{ info.role }}
                </td>
                <td v-if="info.organizationName" class="table-info" align="center">
                    {{ info.organizationName }}
                </td>
                <td v-if="info.inn" class="table-info" align="center">
                    {{ info.inn }}
                </td>
                <td v-if="info.region" class="table-info" align="center">
                    {{ info.region }}
                </td>
                <td v-if="info.district" class="table-info" align="center">
                    {{ info.district }}
                </td>
                <td v-if="info.address" class="table-info" align="center">
                    {{ info.address }}
                </td>
                <td v-if="info.phoneNumber" class="table-info" align="center">
                    {{ info.phoneNumber }}
                </td>
                <td v-if="info.director" class="table-info" align="center">
                    {{ info.director }}
                </td>
                <td v-if="info.state" class="table-info" align="center">
                    <span 
                        :class="`${info.status.toLowerCase() === 'активный' || info.status.toLowerCase() === 'faol' ? 'active' : 'no-active'}`"
                    >
                        {{ info.state }}
                    </span>
                </td>
                <td class="table-info" align="center">
                    <span 
                        class="table-edit"
                        @click="() => $emit('onActionEdit', info.id)"
                    >
                        <Icon name="edit" />
                    </span>
                    <span 
                        class="table-delete" 
                        @click="() => $emit('onActionDelete', info.id)"
                    >
                        <Icon name="delete" />
                    </span>
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
        white-space: pre-line;
        span {
            padding: 10px;
            border-radius: 10px;
            &.active {
                background-color: var(--green);
                color: var(--white);
            }
            &.no-active {
                background-color: var(--red);
                color: var(--white);
            }
        }
        &:first-child {
            font-weight: 600;
        }
    }
}
th {
    white-space: nowrap;
}
tr {
    &:last-child {
        border-bottom: none;
    }
}
</style>
<template>
    <div class="table shadowed" bordercolor="#000">
        <table class="table-wrapper">
            <tr class="table-line">
                <th class="table-title" align="center" style="width: 55px;">
                    №
                </th>
                <th 
                    v-for="title in headers" 
                    :key="title.id" 
                    class="table-title" 
                    align="center" 
                    :style="`width: ${title.width}%;`"
                >
                    {{ $t(title.label) }}
                </th>
                <th 
                    class="table-title" 
                    align="center" 
                >
                    {{ $t("state") }}
                </th>
                <th 
                    v-if="isShowUpdate || isShowDelete"
                    class="table-title" 
                    align="center" 
                >
                    {{ $t("action") }}
                </th>
            </tr>
            <tr class="table-line" v-for="(info, index) in table" :key="info.id">
                <td v-if="info.id" class="table-info" align="center">
                    {{ getId(index) }}
                </td>
                <td v-if="info.material" class="table-info" align="center">
                    {{ info.material }}
                </td>
                <td v-if="info.quantity" class="table-info" align="center">
                    {{ info.quantity }}
                </td>
                <td v-if="info.quantityType" class="table-info" align="center">
                    {{ info.quantityType }}
                </td>
                <td v-if="info.name" class="table-info" align="center">
                    {{ info.name }}
                </td>
                <td v-if="info.company" class="table-info" align="center">
                    {{ info.company }}
                </td>
                <td v-if="info.docDate" class="table-info" align="center" style="white-space: nowrap;">
                    {{ info.docDate }}
                </td>
                <td v-if="info.deadline" class="table-info" align="center" style="white-space: nowrap;">
                    {{ info.deadline }}
                </td>
                <td v-if="info.phone" class="table-info" align="center">
                    {{ info.phone }}
                </td>
                <td v-if="info.role" class="table-info" align="center">
                    {{ info.role }}
                </td>
                <td v-if="info.fullName" class="table-info" align="center">
                    {{ info.fullName }}
                </td>
                <td v-if="info.buildingObject" class="table-info" align="center">
                    {{ info.buildingObject }}
                </td>
                <td v-if="info.objectName" class="table-info" align="center">
                    {{ info.objectName }}
                </td>
                <td v-if="info.blockName" class="table-info" align="center">
                    {{ info.blockName }}
                </td>
                <td v-if="info.cost" class="table-info" align="center">
                    {{ info.cost }}
                </td>
                <td v-if="info.numberOnFloor" class="table-info" align="center">
                    {{ info.numberOnFloor }}
                </td>
                <td v-if="info.roomsOnFloor" class="table-info" align="center">
                    {{ info.roomsOnFloor }}
                </td>
                <td v-if="info.fullAddress" class="table-info" align="center">
                    {{ info.fullAddress }}
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
                <td v-if="info.address" class="table-info no-wraped" align="center">
                    {{ info.address }}
                </td>
                <td v-if="info.price" class="table-info no-wraped" align="center">
                    {{ info.price }}
                </td>
                <td v-if="info.phoneNumber" class="table-info" align="center">
                    {{ info.phoneNumber }}
                </td>
                <td v-if="info.director" class="table-info" align="center">
                    {{ info.director }}
                </td>
                <td v-if="info.state" class="table-info table-state" align="center">
                    <span :class="`${info.stateId === 1 ? 'active' : 'no-active'}`">
                        {{ info.state }}
                    </span>
                </td>
                <td v-if="info.status" class="table-info" align="center">
                    <span :class="`table-status ${ info?.statusId === 1 ? 'created' : info?.statusId === 7 ? 'accepted' : info?.statusId === 20 ? 'expected' : info?.statusId === 15 ? 'refused' : '' }`">
                        {{ info.status }}
                    </span>
                </td>
                <td class="table-info" align="center" v-if="isShowUpdate || isShowDelete">
                    <router-link
                        v-if="isShowUpdate"
                        :to="{ name: to, params: { id: info.id } }" 
                        class="table-edit"
                    >
                        <Icon name="eye" v-if="isShowEye" />
                        <Icon name="edit" v-else />
                    </router-link>
                    <span 
                        v-if="(info.stateId === 1 || info.statusId === 1) && isShowDelete"
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
import { computed } from "vue";

const props = defineProps({
    headers: Array,
    table: Array,
    to: String,
    options: Object,
    isShowEye: {
        type: Boolean,
        default: () => false
    },
    isShowUpdate: {
        type: Boolean,
        default: () => true
    },
    isShowDelete: {
        type: Boolean,
        default: () => true
    }
});

const getId = computed(() => {
    return (id) => props.options.limit * (props.options.page - 1) + id + 1;
});
</script>

<style lang="scss" scoped>
.table {
    overflow-x: auto;
    overflow-y: hidden;
    width: 100%;

    &-wrapper {
        border-collapse: collapse;
        border: none;
        width: 100%;
        overflow-x: auto;
    }

    &-line {
        position: relative;
        &:not(:last-child) {
            border-bottom: 1px solid var(--black-2);
        }
        &:after {
            content: "";
            background-color: var(--legrand);
            height: 100%;
            top: 0;
            left: 0;
            position: absolute;
            width: 4px;
            opacity: 0;
        }
    }

    &-title {
        font-size: 18px;
        font-weight: 500;
        text-transform: uppercase;
        padding: 15px 10px;
    }

    &-info {
        font-size: 16px;
        font-weight: 400;
        padding: 15px 10px;
        white-space: pre-line;
        &:first-child {
            font-weight: 600;
        }
    }
    &-delete {
        margin-left: 30px;
    }
    &-state {
        white-space: nowrap;
        span {
            font-size: 14px;
            position: relative;
            border-radius: 10px;
            &::after {
                content: "";
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                left: 10px;
                width: 10px;
                height: 10px;
                border-radius: 50%;
            }
            &.active {
                background-color: rgba(0, 128, 0, 0.2);
                color: var(--green);
                padding: 6px 15px 6px 35px;
                &::after {
                    background-color: var(--green);
                }
            }
            &.no-active {
                background-color: rgba(255, 0, 0, 0.2);
                color: var(--red);
                padding: 6px 8px 6px 30px;
                &::after {
                    background-color: var(--red);
                }
            }
        }
    }
    &-status {
        width: 160px;
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

@media (hover: hover) {
    .table {
        &-line {
            &:not(:first-child) {
                &:hover {
                    background-color: rgba(var(--base-color-light-separators),.15);
                    &::after {
                        opacity: 1;
                    }
                }
            }
        }
    }
}
</style>
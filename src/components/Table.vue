<template>
    <div class="table shadowed" bordercolor="#000">
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
            <tr class="table-line" v-for="(info, index) in table" :key="info.id">
                <td v-if="info.id" class="table-info" align="center">
                    {{ index + 1 }}
                </td>
                <td v-if="info.name" class="table-info" align="center">
                    {{ info.name }}
                </td>
                <td v-if="info.company" class="table-info" align="center">
                    {{ info.company }}
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
                <td v-if="info.objectName" class="table-info" align="center">
                    {{ info.objectName }}
                </td>
                <td v-if="info.organizationName" class="table-info" align="center">
                    {{ info.organizationName }}
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
                <td v-if="info.phoneNumber" class="table-info" align="center">
                    {{ info.phoneNumber }}
                </td>
                <td v-if="info.director" class="table-info" align="center">
                    {{ info.director }}
                </td>
                <td v-if="info.state" class="table-info no-wraped" align="center">
                    <span :class="`${info.stateId === 1 ? 'active' : 'no-active'}`">
                        {{ info.state }}
                    </span>
                </td>
                <td class="table-info" align="center">
                    <router-link
                        :to="{ name: to, params: { id: info.id } }" 
                        class="table-edit"
                    >
                        <Icon name="edit" />
                    </router-link>
                    <span 
                        v-if="info.stateId === 1"
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
defineProps(["headers", "table", "to"]);
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
        &.no-wraped {
            white-space: nowrap;
        }
        span {
            position: relative;
            padding: 10px 10px 10px 30px;
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
                &::after {
                    background-color: var(--green);
                }
            }
            &.no-active {
                background-color: rgba(255, 0, 0, 0.2);
                color: var(--red);
                &::after {
                    background-color: var(--red);
                }
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
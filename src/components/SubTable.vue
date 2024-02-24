<template>
    <div class="subtable shadowed" bordercolor="#000">
        <table class="subtable-wrapper">
            <tr class="subtable-line">
                <th class="subtable-title" align="center" style="width: 55px;">
                    №
                </th>
                <th 
                    class="subtable-title" 
                    align="center" 
                    v-for="title in headers" 
                    :key="title.id" 
                    :style="`width: ${title.width}px;`"
                >
                    {{ $t(title.label) }}
                </th>
                <th 
                    v-if="isShowDelete"
                    class="subtable-title" 
                    align="center"
                >
                    {{ $t("appAction") }}
                </th>
            </tr>
            <tr class="subtable-line" v-for="(info, index) in table" :key="info.id">
                <td class="subtable-info" align="center">
                    {{ index + 1 }}
                </td>
                <td v-if="info.floorValue" class="subtable-info" align="center">
                    {{ info.floorValue }}
                </td>
                <td v-if="info.costValue" class="subtable-info" align="center">
                    {{ info.costValue }}
                </td>
                <td v-if="info.constructionMaterialValue" class="subtable-info" align="center">
                    {{ info.constructionMaterialValue }}
                </td>
                <td v-if="info.count" class="subtable-info" align="center">
                    {{ info.count }}
                </td>
                <td v-if="info.price" class="subtable-info" align="center">
                    {{ info.price }}
                </td>
                <td class="subtable-info" align="center" v-if="isShowDelete">
                    <span 
                        class="subtable-delete" 
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
const props = defineProps({
    headers: Array, 
    table: Array,
    isShowDelete: {
        type: Boolean,
        default: () => false
    }
});
</script>

<style lang="scss" scoped>
.subtable {
    overflow-x: auto;
    overflow-y: hidden;
    width: 100%;
    margin-bottom: 50px;

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
    &-status {
        white-space: nowrap;
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
    .subtable {
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
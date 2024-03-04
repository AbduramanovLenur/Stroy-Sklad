<template>
    <label class="file-label" :style="`max-width: ${width}px;`">
        <slot />
        <input type="file" hidden style="display:none;" ref="inputFile" multiple @change="handleFileUpload" accept=".xlsx">
        <button class="file-btn" type="button" @click="() => inputFile.click()">
            Select File
        </button>
    </label>
</template>

<script setup>
import * as XLSX from "xlsx";
import { ref } from "vue";

defineProps(["width"]);

const emit = defineEmits(["onChangFile"]);

const inputFile = ref("");

const handleFileUpload = (event) => {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.readAsArrayBuffer(file);

  reader.onload = (e) => {
    let data = [];
    const information = new Uint8Array(e.target.result);

    const workbook = XLSX.read(information, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    emit("onChangFile", data);
  };
};
</script>

<style lang="scss" scoped>
.file {
    &-label {
        font-size: 14px;
        font-weight: 500;
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
    }
    &-btn {
        font-size: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        text-decoration: none;
        background-color: var(--black);
        color: #ffffff;
        padding: 10px 20px;
        border: none;
        outline: none;
        transition: 0.3s;
        border-radius: 10px;
        width: 100%;
        height: 50px;
    }
}
</style>
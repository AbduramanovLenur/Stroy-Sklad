<template>
    <label class="file-label" :style="`max-width: ${width}px;`">
        <slot />
        <input 
          type="file" 
          hidden 
          style="display:none;" 
          ref="inputFile" 
          multiple 
          @change="handleFileUpload" 
          :accept="accept"
        >
        <button 
          class="file-btn" 
          type="button" 
          @click="() => inputFile.click()"
        >
            File
        </button>
    </label>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  width: Number,
  accept: String
});

const emit = defineEmits(["onChangFile"]);

const inputFile = ref("");

const handleFileUpload = (event) => {
  const files = event.target.files;

  if (files.length !== 1) {
    toast.error(t("errorFile"));
    return;
  }

  const file = files[0];

  if (!file) {
    return;
  }

  emit("onChangFile", file);
  event.target.value = '';
};
</script>

<style lang="scss" scoped></style>
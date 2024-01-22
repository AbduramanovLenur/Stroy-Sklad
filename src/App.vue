<template>
  <div class="app">
    <component :is="$route.meta.layout">
      <router-view />
    </component>
  </div>
</template>

<script setup>
import { onMounted } from "vue";

onMounted(() => {
  document.body.classList.add('loaded');
});
</script>

<style lang="scss" scoped>
// .app {
//   overflow: auto;
// }
</style>
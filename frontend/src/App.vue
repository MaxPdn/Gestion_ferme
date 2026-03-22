<script setup>
import { message, show } from "./composables/useNotify.js";
</script>

<template>
  <router-view/>

  <!-- notification -->
  <div v-if="show"
    class="fixed bottom-5 right-5 bg-blue-600 text-white px-4 py-2 rounded shadow">
    {{ message }}
  </div>
</template>
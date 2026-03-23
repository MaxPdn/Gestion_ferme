<template>
  <div class="flex">
    <Sidebar />

    <main class="flex-1 bg-gray-100 min-h-screen">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Sidebar from "./Sidebar.vue";
</script>

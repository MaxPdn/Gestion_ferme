<script setup>
// import AppLayout from './layout/AppLayout.vue';
import Sidebar from './layout/Sidebar.vue';


</script>

<template>
  <div class="flex h-screen overflow-hidden">

    <!-- SIDEBAR -->
    <Sidebar />

    <!-- CONTENT -->
    <div class="flex-1 overflow-y-auto bg-slate-900">
      <RouterView />
    </div>

  </div>
</template>

<style scoped></style>

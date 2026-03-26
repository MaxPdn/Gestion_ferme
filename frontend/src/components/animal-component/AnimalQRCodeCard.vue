<script setup>
defineProps({ qr: String });
</script>

<template>
  <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-center">
    <h3 class="mb-3 font-semibold text-lg">QR Code</h3>

    <img
      v-if="qr"
      :src="qr"
      class="mx-auto w-40 rounded-lg"
    />

    <p v-else class="text-slate-400 text-sm">
      Aucun QR code disponible
    </p>
  </div>
</template>
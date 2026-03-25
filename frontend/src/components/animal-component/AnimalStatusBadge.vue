<script setup>
defineProps({ status: String });
</script>

<template>
  <span
    class="px-3 py-1 rounded-full text-xs font-semibold"
    :class="{
      'bg-green-500/20 text-green-400': status === 'vivant',
      'bg-red-500/20 text-red-400': status === 'mort',
      'bg-yellow-500/20 text-yellow-400': status === 'vendu'
    }"
  >
    {{ status }}
  </span>
</template>
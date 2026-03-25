<script setup>
import { Plus, Activity } from "lucide-vue-next";

const emit = defineEmits(["addWeight", "addHealth"]);
</script>

<template>
<div class="flex gap-3 mt-4">

  <button
    @click="$emit('addWeight')"
    class="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition font-medium shadow-sm"
  >
    <Plus :size="16" />
    Poids
  </button>

  <button
    @click="$emit('addHealth')"
    class="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-xl transition font-medium"
  >
    <Activity :size="16" />
    Santé
  </button>

</div>
</template>
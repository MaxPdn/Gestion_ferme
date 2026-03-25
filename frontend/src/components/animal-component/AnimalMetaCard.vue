<script setup>
import { ref, watch } from "vue";
import { updateStatus } from "@/services/animalService";

const props = defineProps({
  animal: Object
});

const localStatus = ref("");

// sync propre (même si animal arrive plus tard)
watch(
  () => props.animal,
  (animal) => {
    if (animal) {
      localStatus.value = animal.status;
    }
  },
  { immediate: true }
);

const changeStatus = async () => {
  if (!props.animal) return;

  const old = props.animal.status;

  // optimistic update
  props.animal.status = localStatus.value;

  try {
    await updateStatus(props.animal._id, localStatus.value);
  } catch (err) {
    props.animal.status = old;
    localStatus.value = old;
    console.error(err);
  }
};
</script>

<template>
  <div class="card text-xs text-slate-400">
    <p>ID : {{ animal._id }}</p>
    <p>QR : {{ animal.qrCode }}</p>
    <p>Créé : {{ new Date(animal.createdAt).toLocaleDateString() }}</p>
  </div>

  <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">

  <h3 class="text-sm text-gray-500 mb-2">Statut</h3>

  <select
    v-model="localStatus"
    @change="changeStatus"
    class="w-full p-2 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
  >
    <option value="vivant">Vivant</option>
    <option value="mort">Mort</option>
    <option value="vendu">Vendu</option>
  </select>

</div>
</template>
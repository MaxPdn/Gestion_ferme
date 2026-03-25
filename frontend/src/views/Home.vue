<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const logout = () => {
  localStorage.removeItem("token");
  router.push("/");
};
</script>

<template>
<div class="h-screen bg-blue-50 p-8">
  <h1 class="text-3xl text-blue-600">Bienvenue</h1>

  <button @click="logout"
    class="mt-4 bg-blue-600 text-white p-2 rounded">
    Déconnexion
  </button>
</div>
</template>
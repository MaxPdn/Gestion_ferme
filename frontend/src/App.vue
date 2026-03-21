<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

// navigation rapide
const goHome = () => router.push("/");
const goCreate = () => router.push("/create");
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    
    <!-- 🧭 NAVBAR -->
    <nav class="bg-white shadow p-4 flex justify-between items-center">
      <h1
        class="text-xl font-bold text-green-600 cursor-pointer"
        @click="goHome"
      >
        AgroTrack 🌱
      </h1>

      <div class="flex gap-3">
        <button
          @click="goHome"
          class="px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          Campagnes
        </button>

        <button
          @click="goCreate"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          + Nouvelle
        </button>
      </div>
    </nav>

    <!-- 📄 CONTENU -->
    <main class="p-4">
      <router-view />
    </main>

  </div>
</template>
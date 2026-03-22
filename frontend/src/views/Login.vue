<script setup>
import { ref } from "vue";
import axios from "axios";
import { notify } from "../composables/useNotify.js";
import { useRouter } from "vue-router";

const router = useRouter();

const email = ref("");
const password = ref("");

const login = async () => {
  try {
    const res = await axios.post("http://localhost:7000/api/auth/login", {
      email: email.value,
      password: password.value
    });

    localStorage.setItem("token", res.data.token);

    router.push("/home");

  } catch (err) {
    notify(err.response.data.message);
  }
};
</script>

<template>
<div class="flex items-center justify-center h-screen bg-blue-50">
  <div class="bg-white p-8 rounded shadow w-96">
    <h2 class="text-2xl text-blue-600 mb-4">Connexion</h2>

    <input v-model="email" placeholder="Email"
      class="w-full border p-2 mb-3 rounded"/>

    <input type="password" v-model="password"
      placeholder="Mot de passe"
      class="w-full border p-2 mb-3 rounded"/>

    <button @click="login"
      class="w-full bg-blue-600 text-white p-2 rounded">
      Se connecter
    </button>

    <router-link to="/register"
      class="text-blue-500 text-sm block mt-4">
      Pas de compte ? Inscription
    </router-link>
  </div>
</div>
</template>
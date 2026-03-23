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
    localStorage.setItem("user", JSON.stringify(res.data.user));

    router.push("/home");

  } catch (err) {
    notify(err.response?.data?.message || "Erreur de connexion");
  }
};
</script>

<template>
<div class="flex items-center justify-center h-screen bg-blue-50">
  <div class="bg-white p-10 rounded-2xl shadow-xl w-96 border border-blue-100">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-blue-600">Connexion</h2>
      <p class="text-slate-500 text-sm mt-2">Accédez à votre tableau de bord</p>
    </div>

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input v-model="email" type="email" placeholder="votre@email.com"
          class="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"/>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
        <input type="password" v-model="password"
          placeholder="••••••••"
          class="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"/>
      </div>

      <button @click="login"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95">
        Se connecter
      </button>
    </div>
  </div>
</div>
</template>
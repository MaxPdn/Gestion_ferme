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
<div class="flex items-center justify-center min-h-screen bg-slate-50 p-4">
  <div class="bg-white p-6 md:p-10 rounded-3xl shadow-xl w-full max-w-[420px] border border-slate-100">
    <div class="text-center mb-8">
      <div class="inline-flex bg-orange-500/10 p-4 rounded-2xl mb-4">
        <h2 class="text-4xl font-black text-orange-500 tracking-tighter">TC</h2>
      </div>
      <h2 class="text-3xl font-bold text-slate-800">TerraCore</h2>
      <p class="text-slate-500 text-sm mt-2 font-medium">Gestion de Ferme Professionnelle</p>
    </div>

    <div class="space-y-5">
      <div>
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email</label>
        <input v-model="email" type="email" placeholder="votre@email.com"
          class="w-full border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-slate-50/50"/>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Mot de passe</label>
        <input type="password" v-model="password"
          placeholder="••••••••"
          class="w-full border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-slate-50/50"/>
      </div>

      <button @click="login"
        class="w-full bg-[#1e293b] hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 transition-all active:scale-[0.98] mt-2 border-b-4 border-slate-900">
        SE CONNECTER
      </button>

      <div class="pt-6 text-center">
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">© 2026 TerraCore • Système Sécurisé</p>
      </div>
    </div>
  </div>
</div>
</template>
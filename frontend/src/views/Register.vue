<script setup>
// importer ref pour créer des variables réactives
import { ref } from "vue";

// axios pour envoyer les requêtes au backend
import axios from "axios";

// notification reactive
import { notify } from "../composables/useNotify";

// router pour redirection
import { useRouter } from "vue-router";

// initialiser router
const router = useRouter();

// variables réactives liées aux champs
const username = ref("");
const email = ref("");
const password = ref("");

// fonction inscription
const register = async () => {
  try {
    // envoyer données au backend
    await axios.post("http://localhost:7000/api/auth/register", {
      username: username.value,
      email: email.value,
      password: password.value
    });

    // afficher notification succès
    notify("Inscription réussie ! Connectez-vous.");

    // rediriger vers login
    router.push("/");

  } catch (err) {
    // afficher message erreur backend
    notify(err.response?.data?.message || "Erreur inscription");
  }
};
</script>

<template>
  <!-- écran plein hauteur -->
  <div class="flex items-center justify-center h-screen bg-blue-50">

    <!-- carte blanche -->
    <div class="bg-white p-8 rounded shadow w-96">

      <!-- titre -->
      <h2 class="text-2xl font-bold text-blue-600 mb-6 text-center">
        Inscription
      </h2>

      <!-- champ username -->
      <input
        v-model="username"
        type="text"
        placeholder="Nom utilisateur"
        class="w-full border border-blue-200 focus:border-blue-500 focus:outline-none p-2 mb-4 rounded"
      />

      <!-- champ email -->
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        class="w-full border border-blue-200 focus:border-blue-500 focus:outline-none p-2 mb-4 rounded"
      />

      <!-- champ password -->
      <input
        v-model="password"
        type="password"
        placeholder="Mot de passe"
        class="w-full border border-blue-200 focus:border-blue-500 focus:outline-none p-2 mb-4 rounded"
      />

      <!-- bouton inscription -->
      <button
        @click="register"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition duration-200"
      >
        S'inscrire
      </button>

      <!-- lien vers login -->
      <router-link
        to="/"
        class="text-blue-500 text-sm block mt-4 text-center hover:underline"
      >
        Déjà un compte ? Connexion
      </router-link>

    </div>
  </div>
</template>
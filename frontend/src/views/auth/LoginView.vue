<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { login } from '../../api/auth';
import { mensagemErro } from '../../api/http';
import { useAuthStore } from '../../stores/auth';
import Campo from '../../components/ui/Campo.vue';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const email = ref('');
const senha = ref('');
const erro = ref('');
const enviando = ref(false);

// Só caminhos internos: "//site.com" ou "http://…" virariam open redirect.
function destino() {
  const r = route.query.redirect;
  return typeof r === 'string' && r.startsWith('/') && !r.startsWith('//') ? r : { name: 'home' };
}

async function entrar() {
  erro.value = '';
  enviando.value = true;
  try {
    const { token, usuario } = await login(email.value, senha.value);
    auth.definirSessao(token, usuario);
    router.push(destino());
  } catch (err) {
    erro.value = mensagemErro(err);
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="entrar">
    <Campo v-model="email" label="E-mail" type="email" autocomplete="username" required />
    <Campo v-model="senha" label="Senha" type="password" autocomplete="current-password" required />
    <p v-if="erro" role="alert" class="text-sm text-red-700 dark:text-red-400">{{ erro }}</p>
    <button
      type="submit"
      :disabled="enviando"
      class="w-full rounded-lg bg-primary-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-900 disabled:opacity-60"
    >
      {{ enviando ? 'Entrando…' : 'Entrar' }}
    </button>
    <p class="text-center text-sm">
      <RouterLink
        :to="{ name: 'esqueci-senha' }"
        class="text-primary-700 underline dark:text-primary-300"
      >
        Esqueci minha senha
      </RouterLink>
    </p>
  </form>
</template>

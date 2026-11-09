<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { redefinirSenha } from '../../api/auth';
import { mensagemErro } from '../../api/http';
import Campo from '../../components/ui/Campo.vue';

// Serve ao reset e à primeira senha (?novo=1 no link de boas-vindas) — ADR-0012.
const route = useRoute();
const router = useRouter();
const primeiraSenha = route.query.novo === '1';

const senha = ref('');
const confirmacao = ref('');
const erro = ref('');
const enviando = ref(false);

async function salvar() {
  erro.value = '';
  if (senha.value !== confirmacao.value) {
    erro.value = 'As senhas não conferem';
    return;
  }
  enviando.value = true;
  try {
    await redefinirSenha(route.query.token, senha.value);
    router.push({ name: 'login' });
  } catch (err) {
    erro.value = mensagemErro(err);
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <form v-if="route.query.token" class="space-y-4" @submit.prevent="salvar">
    <p class="text-sm text-gray-600 dark:text-gray-400">
      {{ primeiraSenha ? 'Defina sua senha para entrar.' : 'Escolha uma nova senha.' }}
      Mínimo de 8 caracteres, com letra e número.
    </p>
    <Campo v-model="senha" label="Nova senha" type="password" autocomplete="new-password" required />
    <Campo
      v-model="confirmacao"
      label="Confirmar senha"
      type="password"
      autocomplete="new-password"
      required
    />
    <p v-if="erro" role="alert" class="text-sm text-red-700 dark:text-red-400">{{ erro }}</p>
    <button
      type="submit"
      :disabled="enviando"
      class="btn-primario w-full"
    >
      {{ enviando ? 'Salvando…' : 'Salvar senha' }}
    </button>
  </form>
  <p v-else role="alert" class="text-sm">
    Link inválido
    <RouterLink :to="{ name: 'esqueci-senha' }" class="link">
      Solicitar novo link
    </RouterLink>
  </p>
</template>

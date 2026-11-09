<script setup>
import { ref } from 'vue';
import { esqueciSenha } from '../../api/auth';
import { mensagemErro } from '../../api/http';
import Campo from '../../components/ui/Campo.vue';

const email = ref('');
const erro = ref('');
const enviado = ref(false);
const enviando = ref(false);

async function enviar() {
  erro.value = '';
  enviando.value = true;
  try {
    await esqueciSenha(email.value);
    enviado.value = true;
  } catch (err) {
    erro.value = mensagemErro(err);
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <div v-if="enviado" class="space-y-4 text-sm" role="status">
    <p>Se o e-mail estiver cadastrado, enviamos um link para redefinir a senha. Ele vale por 30 minutos.</p>
    <RouterLink :to="{ name: 'login' }" class="link">
      Voltar ao login
    </RouterLink>
  </div>
  <form v-else class="space-y-4" @submit.prevent="enviar">
    <p class="text-sm text-gray-600 dark:text-gray-400">
      Informe seu e-mail e enviaremos um link para definir uma nova senha
    </p>
    <Campo v-model="email" label="E-mail" type="email" autocomplete="email" required />
    <p v-if="erro" role="alert" class="text-sm text-red-700 dark:text-red-400">{{ erro }}</p>
    <button
      type="submit"
      :disabled="enviando"
      class="btn-primario w-full"
    >
      {{ enviando ? 'Enviando…' : 'Enviar link' }}
    </button>
    <p class="text-center text-sm">
      <RouterLink :to="{ name: 'login' }" class="link">
        Voltar ao login
      </RouterLink>
    </p>
  </form>
</template>

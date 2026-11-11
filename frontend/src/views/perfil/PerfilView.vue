<script setup>
import { ref } from 'vue';
import { atualizarPerfil, trocarSenha } from '../../api/auth';
import { mensagemErro } from '../../api/http';
import { useAuthStore } from '../../stores/auth';
import Avatar from '../../components/ui/Avatar.vue';
import Campo from '../../components/ui/Campo.vue';

const auth = useAuthStore();
const rotulos = { admin: 'Administrador', professor: 'Professor', aluno: 'Aluno' };

// --- dados do perfil ---
const nome = ref(auth.usuario.nome);
const arquivo = ref(null);
const msgPerfil = ref({ tipo: '', texto: '' });
const erroNome = ref('');

async function salvarPerfil() {
  msgPerfil.value = { tipo: '', texto: '' };
  erroNome.value = '';
  const dados = new FormData();
  dados.append('nome', nome.value);
  if (arquivo.value) dados.append('avatar', arquivo.value);
  try {
    auth.atualizarUsuario(await atualizarPerfil(dados));
    arquivo.value = null;
    msgPerfil.value = { tipo: 'ok', texto: 'Perfil atualizado' };
  } catch (err) {
    erroNome.value = err.response?.data?.campos?.nome ?? '';
    if (!erroNome.value) msgPerfil.value = { tipo: 'erro', texto: mensagemErro(err) };
  }
}

// --- troca de senha ---
const senhaAtual = ref('');
const senhaNova = ref('');
const msgSenha = ref({ tipo: '', texto: '' });

async function salvarSenha() {
  msgSenha.value = { tipo: '', texto: '' };
  try {
    await trocarSenha(senhaAtual.value, senhaNova.value);
    senhaAtual.value = senhaNova.value = '';
    msgSenha.value = { tipo: 'ok', texto: 'Senha alterada' };
  } catch (err) {
    msgSenha.value = { tipo: 'erro', texto: mensagemErro(err) };
  }
}

const classeMsg = (m) =>
  m.tipo === 'ok' ? 'text-primary-800 dark:text-primary-300' : 'text-red-700 dark:text-red-400';
</script>

<template>
  <main class="mx-auto max-w-3xl px-4 py-8">
    <h1 class="titulo-pagina">Meu perfil</h1>

    <form
      class="mt-6 grid gap-6 rounded-xl border bg-white p-6 shadow-sm sm:grid-cols-[192px_1fr] dark:bg-gray-900"
      @submit.prevent="salvarPerfil"
    >
      <div class="space-y-4">
        <Avatar :usuario="auth.usuario" tamanho="h-24 w-24 text-3xl" />
        <div class="min-w-0 text-sm">
          <p class="truncate font-medium">{{ auth.usuario.email }}</p>
          <p class="text-gray-500 dark:text-gray-400">{{ rotulos[auth.role] }}</p>
        </div>
      </div>

      <div class="space-y-4">
        <Campo v-model="nome" label="Nome" autocomplete="name" required :erro="erroNome" />

        <div>
          <label for="avatar" class="mb-1 block text-sm font-medium">Foto</label>
          <input
            id="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="block w-full text-sm file:mr-3 file:h-10 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:text-sm file:font-medium file:transition-colors hover:file:bg-gray-200 dark:file:bg-gray-800 dark:hover:file:bg-gray-700"
            @change="arquivo = $event.target.files[0] ?? null"
          />
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">jpg, png ou webp, até 2 MB</p>
        </div>

        <p
          v-if="msgPerfil.texto"
          :role="msgPerfil.tipo === 'erro' ? 'alert' : 'status'"
          :class="['text-sm', classeMsg(msgPerfil)]"
        >
          {{ msgPerfil.texto }}
        </p>
        <button type="submit" class="btn-primario">Salvar</button>
      </div>
    </form>

    <form class="mt-8 max-w-sm space-y-4" @submit.prevent="salvarSenha">
      <h2 class="text-lg font-medium">Trocar senha</h2>
      <Campo
        v-model="senhaAtual"
        label="Senha atual"
        type="password"
        autocomplete="current-password"
        required
      />
      <Campo
        v-model="senhaNova"
        label="Nova senha"
        type="password"
        autocomplete="new-password"
        required
      />
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Mínimo de 8 caracteres, com letra e número
      </p>
      <p
        v-if="msgSenha.texto"
        :role="msgSenha.tipo === 'erro' ? 'alert' : 'status'"
        :class="['text-sm', classeMsg(msgSenha)]"
      >
        {{ msgSenha.texto }}
      </p>
      <button type="submit" class="btn-primario">Alterar senha</button>
    </form>
  </main>
</template>

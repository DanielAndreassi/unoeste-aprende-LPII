<script setup>
import { reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { obterPlano, salvarPlano } from '../../api/plano';
import { mensagemErro } from '../../api/http';
import { useAuthStore } from '../../stores/auth';
import BotaoSecundario from '../../components/ui/BotaoSecundario.vue';
import MarkdownView from '../../components/ui/MarkdownView.vue';

const turmaId = useRoute().params.id;
const professor = useAuthStore().role === 'professor';

const SECOES = [
  ['ementa', 'Ementa'],
  ['objetivos', 'Objetivos'],
  ['conteudoProgramatico', 'Conteúdo programático'],
  ['avaliacao', 'Avaliação'],
  ['bibliografia', 'Bibliografia'],
];

const plano = ref(null);
const erro = ref('');
const editando = ref(false);
const salvando = ref(false);
const form = reactive({});

async function carregar() {
  try {
    plano.value = await obterPlano(turmaId);
  } catch (err) {
    erro.value = mensagemErro(err);
  }
}
carregar();

function editar() {
  for (const [campo] of SECOES) form[campo] = plano.value[campo];
  erro.value = '';
  editando.value = true;
}

async function salvar() {
  salvando.value = true;
  erro.value = '';
  try {
    plano.value = await salvarPlano(turmaId, { ...form });
    editando.value = false;
  } catch (err) {
    erro.value = mensagemErro(err);
  } finally {
    salvando.value = false;
  }
}
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h1 class="titulo-pagina">Plano de Ensino</h1>
      <button
        v-if="professor && plano && !editando"
        type="button"
        class="btn-primario"
        @click="editar"
      >
        Editar plano
      </button>
    </div>

    <p v-if="erro" role="alert" class="mt-4 text-sm text-red-700 dark:text-red-400">{{ erro }}</p>

    <form v-if="editando" class="mt-6 space-y-5" @submit.prevent="salvar">
      <p class="text-sm text-gray-600 dark:text-gray-400">Os campos aceitam Markdown.</p>
      <div v-for="[campo, rotulo] in SECOES" :key="campo">
        <label :for="`plano-${campo}`" class="mb-1 block text-sm font-medium">{{ rotulo }}</label>
        <textarea
          :id="`plano-${campo}`"
          v-model="form[campo]"
          rows="6"
          class="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm hover:border-gray-400 focus-visible:border-primary-700 dark:border-gray-700 dark:bg-gray-900"
        />
      </div>
      <div class="flex justify-end gap-2">
        <BotaoSecundario @click="editando = false">Cancelar</BotaoSecundario>
        <button type="submit" class="btn-primario" :disabled="salvando">
          {{ salvando ? 'Salvando…' : 'Salvar' }}
        </button>
      </div>
    </form>

    <div v-else-if="plano" class="mt-6 space-y-4">
      <article v-for="[campo, rotulo] in SECOES" :key="campo" class="painel p-5">
        <h2 class="text-lg font-medium">{{ rotulo }}</h2>
        <MarkdownView v-if="plano[campo]?.trim()" :conteudo="plano[campo]" class="mt-2" />
        <p v-else class="mt-2 text-sm text-gray-600 dark:text-gray-400">Não informado.</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { nextTick, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  criarConversa,
  enviarMensagem,
  excluirConversa,
  listarConversas,
  obterConversa,
} from '../../api/assistente';
import { mensagemErro } from '../../api/http';
import BotaoSecundario from '../../components/ui/BotaoSecundario.vue';
import MarkdownView from '../../components/ui/MarkdownView.vue';
import ConfirmarExclusao from '../../components/admin/ConfirmarExclusao.vue';

const turmaId = useRoute().params.id;

const conversas = ref([]);
const atual = ref(null); // conversa aberta; null = nova (criada no primeiro envio)
const texto = ref('');
const pendente = ref(''); // pergunta enviada, ainda sem resposta
const enviando = ref(false);
const erro = ref('');
const fim = ref(null);
const campo = ref(null);
const restantes = ref(null); // perguntas que sobram hoje; desconhecido até o primeiro envio
const mostrarLista = ref(false); // no celular a lista de conversas fica recolhida

const SUGESTOES = [
  'Quais são os objetivos da disciplina?',
  'Como será a avaliação?',
  'Quais são os próximos eventos?',
];

const modalExcluir = ref(false);
const excluindo = ref(false);
const erroExclusao = ref('');

const rolar = () => nextTick(() => fim.value?.scrollIntoView({ block: 'end' }));

async function carregarLista() {
  try {
    conversas.value = await listarConversas(turmaId);
  } catch (err) {
    erro.value = mensagemErro(err);
  }
}
carregarLista();

async function abrir(c) {
  erro.value = '';
  try {
    atual.value = await obterConversa(c._id);
    mostrarLista.value = false;
    rolar();
  } catch (err) {
    erro.value = mensagemErro(err);
  }
}

function nova() {
  atual.value = null;
  erro.value = '';
}

async function enviar() {
  const pergunta = texto.value.trim();
  if (!pergunta || enviando.value) return;
  enviando.value = true;
  erro.value = '';
  pendente.value = pergunta;
  rolar();
  try {
    // atual já aponta para a conversa criada: se o envio falhar, a nova tentativa reaproveita
    atual.value ??= await criarConversa(turmaId);
    const { restantes: sobram, ...conversa } = await enviarMensagem(atual.value._id, pergunta);
    atual.value = conversa;
    restantes.value = sobram;
    texto.value = '';
    carregarLista();
  } catch (err) {
    // o texto digitado fica no campo para tentar de novo
    erro.value = mensagemErro(err);
    if (err.response?.status === 429) restantes.value = 0;
  } finally {
    pendente.value = '';
    enviando.value = false;
    rolar();
    nextTick(() => campo.value?.focus());
  }
}

// Enter envia; Shift+Enter quebra a linha
function teclar(e) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    enviar();
  }
}

function sugerir(pergunta) {
  texto.value = pergunta;
  campo.value?.focus();
}

async function confirmarExclusao() {
  excluindo.value = true;
  erroExclusao.value = '';
  try {
    await excluirConversa(atual.value._id);
    atual.value = null;
    modalExcluir.value = false;
    await carregarLista();
  } catch (err) {
    erroExclusao.value = mensagemErro(err);
  } finally {
    excluindo.value = false;
  }
}
</script>

<template>
  <section>
    <h1 class="text-2xl font-medium">Assistente IA</h1>
    <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
      Tire dúvidas sobre esta disciplina. O assistente usa o plano de ensino, o conteúdo e os
      eventos da turma, mas não lê o texto dos PDFs.
    </p>

    <div class="mt-6 grid gap-4 lg:grid-cols-[16rem_1fr]">
      <aside class="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
        <button
          type="button"
          class="btn-primario w-full"
          :disabled="enviando"
          @click="
            nova();
            mostrarLista = false;
          "
        >
          Nova conversa
        </button>
        <button
          type="button"
          class="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 lg:hidden dark:text-gray-300 dark:hover:bg-gray-800"
          :aria-expanded="mostrarLista"
          aria-controls="lista-conversas"
          @click="mostrarLista = !mostrarLista"
        >
          Conversas anteriores ({{ conversas.length }})
        </button>
        <ul
          id="lista-conversas"
          :class="[
            'mt-3 max-h-64 space-y-1 overflow-y-auto lg:block lg:max-h-[28rem]',
            !mostrarLista && 'hidden',
          ]"
        >
          <li v-for="c in conversas" :key="c._id">
            <button
              type="button"
              :disabled="enviando"
              :aria-current="atual?._id === c._id"
              :class="[
                'w-full truncate rounded-lg px-3 py-2 text-left text-sm hover:bg-primary-50 dark:hover:bg-gray-800',
                atual?._id === c._id &&
                  'bg-primary-100 font-semibold text-primary-900 dark:bg-gray-800 dark:text-primary-300',
              ]"
              @click="abrir(c)"
            >
              {{ c.titulo }}
            </button>
          </li>
        </ul>
        <p
          v-if="!conversas.length"
          class="mt-3 hidden text-sm text-gray-600 lg:block dark:text-gray-400"
        >
          Nenhuma conversa ainda.
        </p>
      </aside>

      <div class="flex min-h-[28rem] flex-col rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-900">
        <div v-if="atual" class="mb-2 flex items-center justify-between gap-3">
          <h2 class="truncate text-sm font-medium">{{ atual.titulo }}</h2>
          <BotaoSecundario perigo :disabled="enviando" @click="modalExcluir = true">
            Excluir conversa
          </BotaoSecundario>
        </div>

        <div class="flex-1 space-y-3 overflow-y-auto" aria-live="polite" :aria-busy="enviando">
          <div v-if="!atual?.mensagens.length && !pendente">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Faça sua primeira pergunta abaixo ou comece por uma sugestão:
            </p>
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="s in SUGESTOES"
                :key="s"
                type="button"
                class="rounded-full border border-gray-300 px-3 py-1.5 text-sm hover:bg-primary-50 dark:border-gray-700 dark:hover:bg-gray-800"
                @click="sugerir(s)"
              >
                {{ s }}
              </button>
            </div>
          </div>
          <div
            v-for="(m, i) in atual?.mensagens ?? []"
            :key="i"
            :class="m.autor === 'usuario' ? 'flex justify-end' : 'flex justify-start'"
          >
            <div
              :class="[
                'max-w-[85%] rounded-2xl px-4 py-2 text-sm',
                m.autor === 'usuario'
                  ? 'bg-primary-800 text-white'
                  : 'bg-gray-100 dark:bg-gray-800',
              ]"
            >
              <p v-if="m.autor === 'usuario'" class="whitespace-pre-wrap">{{ m.texto }}</p>
              <MarkdownView v-else :conteudo="m.texto" />
            </div>
          </div>
          <template v-if="pendente">
            <div class="flex justify-end">
              <p
                class="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-primary-800 px-4 py-2 text-sm text-white"
              >
                {{ pendente }}
              </p>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Pensando…</p>
          </template>
          <div ref="fim" />
        </div>

        <p v-if="erro" role="alert" class="mt-3 text-sm text-red-700 dark:text-red-400">
          {{ erro }}
        </p>

        <p v-if="restantes === 0" class="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Você usou as 30 perguntas de hoje. Volte amanhã.
        </p>
        <form v-else class="mt-3 flex items-end gap-2" @submit.prevent="enviar">
          <label for="pergunta" class="sr-only">Sua pergunta</label>
          <textarea
            id="pergunta"
            ref="campo"
            v-model="texto"
            rows="2"
            maxlength="2000"
            placeholder="Pergunte sobre a disciplina (Enter envia, Shift+Enter quebra a linha)"
            class="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white p-3 text-sm hover:border-gray-400 focus-visible:border-primary-700 dark:border-gray-700 dark:bg-gray-900"
            @keydown="teclar"
          />
          <button type="submit" class="btn-primario" :disabled="enviando || !texto.trim()">
            Enviar
          </button>
        </form>
        <p v-if="restantes > 0" class="mt-1 text-xs text-gray-600 dark:text-gray-400">
          {{ restantes }} {{ restantes === 1 ? 'pergunta restante' : 'perguntas restantes' }} hoje
        </p>
      </div>
    </div>

    <ConfirmarExclusao
      v-model="modalExcluir"
      :texto="{
        titulo: 'Excluir conversa',
        rotulo: 'Excluir',
        mensagem: `Excluir a conversa “${atual?.titulo}”?`,
      }"
      :erro="erroExclusao"
      :enviando="excluindo"
      @confirmar="confirmarExclusao"
    />
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import {
  chaveDia,
  gradeDoMes,
  localParaIso,
  paraExibicao,
  rotuloDia,
  rotuloMes,
  somarDias,
} from '../../utils/datas';
import { infoTipo, TIPOS } from './tipos';
import BotaoSecundario from '../ui/BotaoSecundario.vue';
import Modal from '../ui/Modal.vue';

// Grade mensal feita à mão. Quem usa informa `eventos` (ISO) e recebe `periodo` { de, ate } sempre que o mês muda.
// Slot `acoes` ({ evento, fechar }) aparece no detalhe de cada evento (ex.: editar, excluir).
const props = defineProps({ eventos: { type: Array, default: () => [] } });
const emit = defineEmits(['periodo']);

const SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MAX_CHIPS = 3;
const hoje = chaveDia(new Date());
const [anoHoje, mesHoje] = hoje.split('-').map(Number);

const ano = ref(anoHoje);
const mes = ref(mesHoje);
const diaSel = ref(hoje); // dia da lista do mobile
const grade = computed(() => gradeDoMes(ano.value, mes.value));
const prefixo = computed(() => `${ano.value}-${String(mes.value).padStart(2, '0')}`);
const rotulo = computed(() => rotuloMes(ano.value, mes.value));

// Só a grade é buscada: de 00:00 do primeiro dia até 00:00 do dia seguinte ao último
watch(
  grade,
  (g) =>
    emit('periodo', {
      de: localParaIso(`${g[0]}T00:00`),
      ate: localParaIso(`${somarDias(g[41], 1)}T00:00`),
    }),
  { immediate: true },
);

// Dia → [{ e, ini, fim }]: o evento aparece em todos os dias do intervalo; ini/fim marcam início e fim
const porDia = computed(() => {
  const mapa = {};
  const ordenados = [...props.eventos].sort((a, b) => a.inicio.localeCompare(b.inicio));
  for (const e of ordenados) {
    const ini = chaveDia(e.inicio);
    const fim = chaveDia(e.fim);
    for (const k of grade.value) {
      if (k >= ini && k <= fim) (mapa[k] ??= []).push({ e, ini: k === ini, fim: k === fim });
    }
  }
  return mapa;
});

function itensDia(k) {
  return porDia.value[k] ?? [];
}

function irPara(a, m) {
  ano.value = a;
  mes.value = m;
  diaSel.value = a === anoHoje && m === mesHoje ? hoje : `${a}-${String(m).padStart(2, '0')}-01`;
}

function mudarMes(delta) {
  const d = new Date(Date.UTC(ano.value, mes.value - 1 + delta, 1));
  irPara(d.getUTCFullYear(), d.getUTCMonth() + 1);
}

function irHoje() {
  irPara(anoHoje, mesHoje);
}

// Detalhe em janela modal: um dia (todos os eventos dele) ou um evento
const modalDetalhe = ref(false);
const detalhe = ref({ titulo: '', itens: [] });

function abrirDia(k) {
  diaSel.value = k;
  detalhe.value = { titulo: rotuloDia(k), itens: itensDia(k).map((x) => x.e) };
  modalDetalhe.value = true;
}

function abrirEvento(e) {
  detalhe.value = { titulo: e.titulo, itens: [e] };
  modalDetalhe.value = true;
}

function fechar() {
  modalDetalhe.value = false;
}

// Só http(s): o link vem de usuário e não pode virar javascript: no href
function linkSeguro(url) {
  return /^https?:\/\//i.test(url ?? '');
}

function rotuloCelula(k) {
  const n = itensDia(k).length;
  const quantos = n === 1 ? '1 evento' : `${n} eventos`;
  return n ? `${rotuloDia(k)}, ${quantos}` : rotuloDia(k);
}

function rotuloChip({ e, ini, fim }) {
  let texto = `${e.titulo}, ${infoTipo(e.tipo).rotulo}`;
  if (ini) texto += ', começa neste dia';
  if (fim) texto += ', termina neste dia';
  return texto;
}

// Setas movem o foco entre os dias (o botão do dia tem data-dia com o índice na grade)
function navegarTeclado(ev) {
  const passo = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[ev.key];
  const i = Number(ev.target.dataset?.dia);
  if (passo === undefined || Number.isNaN(i)) return;
  ev.preventDefault();
  const botoes = ev.currentTarget.querySelectorAll('[data-dia]');
  botoes[Math.min(41, Math.max(0, i + passo))]?.focus();
}
</script>

<template>
  <div class="@container">
    <div class="flex items-center gap-1">
      <h2 class="min-w-0 flex-1 truncate text-base font-medium" aria-live="polite">{{ rotulo }}</h2>
      <BotaoSecundario aria-label="Mês anterior" class="w-10 px-0" @click="mudarMes(-1)">
        <span class="flex justify-center">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </span>
      </BotaoSecundario>
      <BotaoSecundario aria-label="Próximo mês" class="w-10 px-0" @click="mudarMes(1)">
        <span class="flex justify-center">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </span>
      </BotaoSecundario>
      <BotaoSecundario class="border" @click="irHoje">Hoje</BotaoSecundario>
    </div>

    <ul class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
      <li v-for="(t, valor) in TIPOS" :key="valor" class="flex items-center gap-2">
        <span :class="['size-2 rounded-full', t.ponto]" aria-hidden="true" />{{ t.rotulo }}
      </li>
      <li class="flex items-center gap-2">
        <span class="size-2 rounded-full border-2 border-current" aria-hidden="true" />Início
      </li>
      <li class="flex items-center gap-2">
        <span class="size-2 rounded-full bg-current" aria-hidden="true" />Fim
      </li>
    </ul>

    <div
      class="mt-4 grid grid-cols-7 gap-px overflow-hidden rounded-xl border bg-gray-200 dark:bg-gray-800"
      role="group"
      aria-label="Dias do mês"
      @keydown="navegarTeclado"
    >
      <div
        v-for="s in SEMANA"
        :key="s"
        aria-hidden="true"
        class="bg-gray-50 py-2 text-center text-xs font-medium text-gray-600 dark:bg-gray-900 dark:text-gray-400"
      >
        {{ s }}
      </div>

      <div
        v-for="(k, i) in grade"
        :key="k"
        :class="[
          'flex min-w-0 flex-col gap-1 bg-white p-1 @2xl:min-h-32 @2xl:p-2 dark:bg-gray-900',
          k.slice(0, 7) !== prefixo && 'text-gray-400 dark:text-gray-600',
        ]"
      >
        <button
          type="button"
          :data-dia="i"
          :aria-label="rotuloCelula(k)"
          :aria-current="k === hoje ? 'date' : undefined"
          :class="[
            'flex h-8 w-8 items-center justify-center self-center rounded-full text-sm tabular-nums @2xl:self-start',
            k === hoje && 'bg-primary-800 font-medium text-white dark:bg-primary-600',
            k === diaSel && k !== hoje && 'ring-2 ring-primary-600',
          ]"
          @click="abrirDia(k)"
        >
          {{ Number(k.slice(8)) }}
        </button>

        <!-- Desktop: chips coloridos por tipo -->
        <div class="hidden min-w-0 flex-col gap-1 @2xl:flex">
          <button
            v-for="it in itensDia(k).slice(0, MAX_CHIPS)"
            :key="it.e._id"
            type="button"
            :aria-label="rotuloChip(it)"
            :title="it.e.titulo"
            :class="[
              'flex min-w-0 items-center gap-1 rounded border-l-2 px-1.5 py-0.5 text-left text-xs',
              infoTipo(it.e.tipo).chip,
            ]"
            @click="abrirEvento(it.e)"
          >
            <span
              v-if="it.ini"
              class="size-2 shrink-0 rounded-full border-2 border-current"
              aria-hidden="true"
            />
            <span
              v-if="it.fim"
              class="size-2 shrink-0 rounded-full bg-current"
              aria-hidden="true"
            />
            <span class="min-w-0 truncate">{{ it.e.titulo }}</span>
          </button>
          <button
            v-if="itensDia(k).length > MAX_CHIPS"
            type="button"
            class="px-1 text-left text-xs font-medium text-primary-800 hover:underline dark:text-primary-300"
            @click="abrirDia(k)"
          >
            +{{ itensDia(k).length - MAX_CHIPS }}
          </button>
        </div>

        <!-- Mobile: só bolinhas; a lista do dia aparece embaixo -->
        <div class="flex gap-0.5 @2xl:hidden" aria-hidden="true">
          <span
            v-for="it in itensDia(k).slice(0, MAX_CHIPS)"
            :key="it.e._id"
            :class="['size-1.5 rounded-full', infoTipo(it.e.tipo).ponto]"
          />
        </div>
      </div>
    </div>

    <section class="mt-4 @2xl:hidden" aria-labelledby="calendario-dia-sel">
      <h3 id="calendario-dia-sel" class="font-medium">{{ rotuloDia(diaSel) }}</h3>
      <ul v-if="itensDia(diaSel).length" class="mt-2 space-y-2">
        <li v-for="it in itensDia(diaSel)" :key="it.e._id">
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-lg border p-3 text-left text-sm"
            @click="abrirEvento(it.e)"
          >
            <span
              :class="['size-2 shrink-0 rounded-full', infoTipo(it.e.tipo).ponto]"
              aria-hidden="true"
            />
            <span class="min-w-0 flex-1 truncate">{{ it.e.titulo }}</span>
            <span class="shrink-0 text-xs text-gray-600 dark:text-gray-400">
              {{ it.ini ? 'Começa' : it.fim ? 'Termina' : infoTipo(it.e.tipo).rotulo }}
            </span>
          </button>
        </li>
      </ul>
      <p v-else class="mt-2 text-sm text-gray-600 dark:text-gray-400">Nenhum evento neste dia.</p>
    </section>

    <Modal v-model="modalDetalhe" :titulo="detalhe.titulo">
      <p v-if="!detalhe.itens.length" class="text-sm text-gray-600 dark:text-gray-400">
        Nenhum evento neste dia.
      </p>
      <ul v-else class="space-y-4">
        <li v-for="e in detalhe.itens" :key="e._id" class="space-y-1 border-b pb-4 last:border-0">
          <span
            :class="[
              'inline-block rounded px-1.5 py-0.5 text-xs font-medium',
              infoTipo(e.tipo).chip,
            ]"
            >{{ infoTipo(e.tipo).rotulo }}</span
          >
          <p class="font-medium">{{ e.titulo }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Início: {{ paraExibicao(e.inicio) }}<br />
            Fim: {{ paraExibicao(e.fim) }}<br />
            {{ e.turma ? e.turma.rotulo : 'Evento institucional' }}
          </p>
          <a
            v-if="linkSeguro(e.link)"
            :href="e.link"
            target="_blank"
            rel="noopener noreferrer"
            class="link inline-block text-sm"
          >
            {{ e.tipo === 'aula-ao-vivo' ? 'Entrar na reunião' : 'Abrir link' }}
          </a>
          <div v-if="$slots.acoes" class="flex flex-wrap gap-2 pt-1">
            <slot name="acoes" :evento="e" :fechar="fechar" />
          </div>
        </li>
      </ul>
    </Modal>
  </div>
</template>

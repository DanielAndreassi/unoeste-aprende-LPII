<script setup>
import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  atualizarAvaliacao,
  criarAvaliacao,
  excluirAvaliacao,
  lancarNotas,
  tabelaNotas,
} from '../../api/notas';
import { mensagemErro } from '../../api/http';
import { useCrud } from '../../composables/useCrud';
import { useAuthStore } from '../../stores/auth';
import { isoParaLocal, localParaIso } from '../../utils/datas';
import BotaoSecundario from '../../components/ui/BotaoSecundario.vue';
import Campo from '../../components/ui/Campo.vue';
import Modal from '../../components/ui/Modal.vue';
import ConfirmarExclusao from '../../components/admin/ConfirmarExclusao.vue';

const route = useRoute();
const auth = useAuthStore();
const turmaId = route.params.id;
const professor = auth.role === 'professor';

const tabela = ref({ avaliacoes: [], alunos: [] });
// Rascunho das células digitadas: "alunoId:avaliacaoId" → texto do input
const rascunho = reactive({});
const salvandoNotas = ref(false);
const erroNotas = ref('');
const okNotas = ref(false);

const {
  carregando,
  erro,
  carregar,
  modalForm,
  editando,
  abrirForm,
  salvando,
  campos,
  erroForm,
  salvar,
  modalExcluir,
  textoExclusao,
  pedirExclusao,
  excluindo,
  erroExclusao,
  confirmarExclusao,
} = useCrud({
  // a tela vive da tabela inteira; o useCrud só precisa de um array para recarregar
  listar: async () => {
    tabela.value = await tabelaNotas(turmaId);
    for (const k of Object.keys(rascunho)) delete rascunho[k];
    return tabela.value.avaliacoes;
  },
  criar: (corpo) => criarAvaliacao(turmaId, corpo),
  atualizar: atualizarAvaliacao,
  excluir: excluirAvaliacao,
});
carregar();

const formVazio = () => ({ nome: '', peso: '1', data: '' });
const form = reactive(formVazio());

function nova() {
  Object.assign(form, formVazio());
  abrirForm();
}

function editar(a) {
  Object.assign(form, {
    nome: a.nome,
    peso: String(a.peso),
    data: a.data ? isoParaLocal(a.data).slice(0, 10) : '',
  });
  abrirForm(a);
}

function enviar() {
  salvar({
    nome: form.nome,
    peso: form.peso === '' ? undefined : Number(form.peso),
    // data sem hora: meio-dia em São Paulo evita virar o dia anterior em UTC
    data: form.data ? localParaIso(`${form.data}T12:00`) : null,
  });
}

function pedirExcluir(a) {
  pedirExclusao(
    a,
    `Excluir a avaliação “${a.nome}”? As notas lançadas nela também serão apagadas.`,
  );
}

const chave = (aluno, avaliacao) => `${aluno._id}:${avaliacao._id}`;
const valorAtual = (linha, avaliacao) => linha.notas[avaliacao._id];

function texto(linha, avaliacao) {
  const c = chave(linha.aluno, avaliacao);
  if (c in rascunho) return rascunho[c];
  const v = valorAtual(linha, avaliacao);
  return v == null ? '' : String(v);
}

// Só vira lote o que mudou em relação ao servidor
const alteradas = computed(() => {
  const porAvaliacao = new Map();
  for (const linha of tabela.value.alunos)
    for (const a of tabela.value.avaliacoes) {
      const c = chave(linha.aluno, a);
      if (!(c in rascunho)) continue;
      const novo = rascunho[c].trim() === '' ? null : Number(rascunho[c].replace(',', '.'));
      if (novo === (valorAtual(linha, a) ?? null)) continue;
      if (!porAvaliacao.has(a._id)) porAvaliacao.set(a._id, []);
      porAvaliacao.get(a._id).push({ aluno: linha.aluno._id, valor: novo });
    }
  return porAvaliacao;
});

async function salvarNotas() {
  salvandoNotas.value = true;
  erroNotas.value = '';
  okNotas.value = false;
  try {
    for (const [avaliacaoId, lote] of alteradas.value) await lancarNotas(avaliacaoId, lote);
    await carregar();
    okNotas.value = true;
  } catch (err) {
    erroNotas.value = mensagemErro(err);
  } finally {
    salvandoNotas.value = false;
  }
}

const nota = (v) => (v == null ? '—' : v.toLocaleString('pt-BR', { maximumFractionDigits: 2 }));
const selo = {
  Aprovado: 'bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-200',
  Reprovado: 'bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200',
  'Em andamento': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};
const dataCurta = (iso) =>
  new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h1 class="titulo-pagina">Notas</h1>
      <button v-if="professor" type="button" class="btn-primario" @click="nova">
        Nova avaliação
      </button>
    </div>
    <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
      Média ponderada pelo peso das avaliações com nota lançada. Aprovação com média 6,0 ou mais
      depois de todas as notas lançadas.
    </p>

    <p v-if="erro" role="alert" class="mt-4 text-sm text-red-700 dark:text-red-400">{{ erro }}</p>

    <div class="painel mt-6 overflow-x-auto p-4 sm:p-6" :aria-busy="carregando">
      <p v-if="!carregando && !tabela.avaliacoes.length" class="text-sm">
        {{
          professor
            ? 'Nenhuma avaliação criada ainda.'
            : 'O professor ainda não cadastrou avaliações.'
        }}
      </p>

      <table v-else-if="tabela.avaliacoes.length" class="w-full min-w-max text-sm tabular-nums">
        <thead>
          <tr class="border-b border-gray-200 text-left dark:border-gray-700">
            <th scope="col" class="py-2 pr-4 font-medium">Aluno</th>
            <th
              v-for="a in tabela.avaliacoes"
              :key="a._id"
              scope="col"
              class="px-2 py-2 font-medium"
            >
              <div>{{ a.nome }}</div>
              <div class="text-xs font-normal text-gray-600 dark:text-gray-400">
                peso {{ nota(a.peso) }}<template v-if="a.data"> · {{ dataCurta(a.data) }}</template>
              </div>
              <div v-if="professor" class="mt-1 flex gap-1">
                <BotaoSecundario class="border !h-8 !px-2 text-xs" @click="editar(a)"
                  >Editar</BotaoSecundario
                >
                <BotaoSecundario perigo class="!h-8 !px-2 text-xs" @click="pedirExcluir(a)"
                  >Excluir</BotaoSecundario
                >
              </div>
            </th>
            <th scope="col" class="px-2 py-2 font-medium">Média</th>
            <th scope="col" class="px-2 py-2 font-medium">Situação</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="linha in tabela.alunos"
            :key="linha.aluno._id"
            class="border-b border-gray-100 dark:border-gray-800"
          >
            <th scope="row" class="py-2 pr-4 text-left font-normal">{{ linha.aluno.nome }}</th>
            <td v-for="a in tabela.avaliacoes" :key="a._id" class="px-2 py-2">
              <input
                v-if="professor"
                type="number"
                min="0"
                max="10"
                step="0.1"
                inputmode="decimal"
                :aria-label="`Nota de ${linha.aluno.nome} em ${a.nome}`"
                :value="texto(linha, a)"
                class="h-11 w-20 sm:h-10 rounded-lg border border-gray-300 bg-white px-2 text-sm hover:border-gray-400 focus-visible:border-primary-700 dark:border-gray-700 dark:bg-gray-900"
                @input="rascunho[chave(linha.aluno, a)] = $event.target.value"
              />
              <span v-else>{{ nota(valorAtual(linha, a)) }}</span>
            </td>
            <td class="px-2 py-2 font-medium">{{ nota(linha.media) }}</td>
            <td class="px-2 py-2">
              <span :class="['rounded-full px-2 py-1 text-xs font-medium', selo[linha.situacao]]">{{
                linha.situacao
              }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div
        v-if="professor && tabela.avaliacoes.length"
        class="mt-4 flex flex-wrap items-center gap-3"
      >
        <button
          type="button"
          class="btn-primario"
          :disabled="salvandoNotas || !alteradas.size"
          @click="salvarNotas"
        >
          {{ salvandoNotas ? 'Salvando…' : 'Salvar notas' }}
        </button>
        <p v-if="erroNotas" role="alert" class="text-sm text-red-700 dark:text-red-400">
          {{ erroNotas }}
        </p>
        <p v-else-if="okNotas" role="status" class="text-sm text-green-800 dark:text-green-300">
          Notas salvas.
        </p>
      </div>
    </div>

    <Modal v-model="modalForm" :titulo="editando ? 'Editar avaliação' : 'Nova avaliação'">
      <form class="space-y-4" @submit.prevent="enviar">
        <Campo v-model="form.nome" label="Nome" required :erro="campos.nome" />
        <Campo
          v-model="form.peso"
          label="Peso"
          type="number"
          min="0.1"
          step="0.1"
          required
          :erro="campos.peso"
        />
        <Campo v-model="form.data" label="Data (opcional)" type="date" :erro="campos.data" />
        <p v-if="erroForm" role="alert" class="text-sm text-red-700 dark:text-red-400">
          {{ erroForm }}
        </p>
        <div class="flex justify-end gap-2">
          <BotaoSecundario @click="modalForm = false">Cancelar</BotaoSecundario>
          <button type="submit" class="btn-primario" :disabled="salvando">
            {{ salvando ? 'Salvando…' : 'Salvar' }}
          </button>
        </div>
      </form>
    </Modal>

    <ConfirmarExclusao
      v-model="modalExcluir"
      :texto="textoExclusao"
      :erro="erroExclusao"
      :enviando="excluindo"
      @confirmar="confirmarExclusao"
    />
  </section>
</template>

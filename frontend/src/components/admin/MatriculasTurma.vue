<script setup>
import { computed, ref, watch } from 'vue';
import { matriculas } from '../../api/admin';
import { mensagemErro } from '../../api/http';
import BotaoSecundario from '../ui/BotaoSecundario.vue';
import Modal from '../ui/Modal.vue';
import ConfirmarExclusao from './ConfirmarExclusao.vue';
import SelecaoUsuarios from './SelecaoUsuarios.vue';

// Matrículas de uma turma: lista os matriculados, matricula alunos em lote e remove matrículas.
const props = defineProps({ turmaId: String, rotulo: String });
const aberto = defineModel({ default: false });

const lista = ref([]);
const carregando = ref(false);
const erro = ref('');
const alunos = ref([]);
const enviando = ref(false);
const alvo = ref(null);
const modalRemover = ref(false);
const removendo = ref(false);
const erroRemover = ref('');

const idsMatriculados = computed(() => lista.value.map((m) => m.aluno?._id ?? m.aluno));
const nomeAluno = (m) => m.aluno?.nome ?? 'Aluno';
const textoRemover = computed(() => ({
  titulo: 'Remover matrícula',
  rotulo: 'Remover',
  mensagem: `Remover ${alvo.value ? nomeAluno(alvo.value) : ''} desta turma?`,
}));

async function carregarLista() {
  carregando.value = true;
  try {
    lista.value = await matriculas.listar(props.turmaId);
    erro.value = '';
  } catch (err) {
    erro.value = mensagemErro(err);
  } finally {
    carregando.value = false;
  }
}

watch([aberto, () => props.turmaId], ([aoAbrir]) => {
  if (!aoAbrir) return;
  alunos.value = [];
  erro.value = '';
  carregarLista();
});

async function matricular() {
  enviando.value = true;
  erro.value = '';
  try {
    await matriculas.matricular(
      props.turmaId,
      alunos.value.map((a) => a._id),
    );
    alunos.value = [];
    await carregarLista();
  } catch (err) {
    erro.value = mensagemErro(err);
  } finally {
    enviando.value = false;
  }
}

function pedirRemover(m) {
  alvo.value = m;
  erroRemover.value = '';
  modalRemover.value = true;
}

async function remover() {
  removendo.value = true;
  erroRemover.value = '';
  try {
    await matriculas.remover(alvo.value._id);
    modalRemover.value = false;
    await carregarLista();
  } catch (err) {
    erroRemover.value = mensagemErro(err);
  } finally {
    removendo.value = false;
  }
}
</script>

<template>
  <Modal v-model="aberto" :titulo="`Matrículas — ${rotulo}`">
    <div class="space-y-6">
      <section aria-labelledby="matriculados-titulo">
        <h3 id="matriculados-titulo" class="text-sm font-medium">
          Matriculados ({{ lista.length }})
        </h3>
        <p v-if="carregando" class="mt-2 text-sm text-gray-500" aria-busy="true">Carregando…</p>
        <p v-else-if="!lista.length" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Nenhum aluno matriculado.
        </p>
        <ul v-else class="mt-2 max-h-56 divide-y overflow-y-auto rounded-lg border">
          <li v-for="m in lista" :key="m._id" class="flex items-center gap-2 px-3 py-2 text-sm">
            <span class="min-w-0 flex-1 truncate">
              {{ nomeAluno(m) }}
              <span class="text-gray-500 dark:text-gray-400">{{ m.aluno?.email }}</span>
            </span>
            <BotaoSecundario
              perigo
              :aria-label="`Remover ${nomeAluno(m)} da turma`"
              @click="pedirRemover(m)"
            >
              Remover
            </BotaoSecundario>
          </li>
        </ul>
      </section>

      <section aria-labelledby="matricular-titulo" class="space-y-3">
        <h3 id="matricular-titulo" class="text-sm font-medium">Matricular alunos</h3>
        <SelecaoUsuarios
          v-model="alunos"
          papel="aluno"
          rotulo="aluno"
          :excluidos="idsMatriculados"
        />
        <p v-if="erro" role="alert" class="text-sm text-red-700 dark:text-red-400">{{ erro }}</p>
        <div class="flex items-center justify-between gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            {{ alunos.length }} selecionado(s)
          </span>
          <button
            type="button"
            class="btn-primario"
            :disabled="!alunos.length || enviando"
            @click="matricular"
          >
            {{ enviando ? 'Matriculando…' : 'Matricular' }}
          </button>
        </div>
      </section>
    </div>
  </Modal>

  <ConfirmarExclusao
    v-model="modalRemover"
    :texto="textoRemover"
    :erro="erroRemover"
    :enviando="removendo"
    @confirmar="remover"
  />
</template>

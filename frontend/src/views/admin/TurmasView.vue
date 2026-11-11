<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { disciplinas, turmas } from '../../api/admin';
import { useCrud } from '../../composables/useCrud';
import BotaoSecundario from '../../components/ui/BotaoSecundario.vue';
import Campo from '../../components/ui/Campo.vue';
import CampoSelect from '../../components/ui/CampoSelect.vue';
import Modal from '../../components/ui/Modal.vue';
import ConfirmarExclusao from '../../components/admin/ConfirmarExclusao.vue';
import MatriculasTurma from '../../components/admin/MatriculasTurma.vue';
import SelecaoUsuarios from '../../components/admin/SelecaoUsuarios.vue';
import Tabela from '../../components/admin/Tabela.vue';

const listaDisciplinas = ref([]);

const {
  itens,
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
  // a lista precisa das disciplinas para o select e para mostrar o nome na tabela
  async listar() {
    const [t, d] = await Promise.all([turmas.listar(), disciplinas.listar()]);
    listaDisciplinas.value = d;
    return t;
  },
  criar: turmas.criar,
  atualizar: turmas.atualizar,
  excluir: turmas.excluir,
});

const nomeDisciplina = (t) =>
  t.disciplina?.nome ?? listaDisciplinas.value.find((d) => d._id === t.disciplina)?.nome ?? '—';
const rotuloTurma = (t) => `${nomeDisciplina(t)} - ${t.codigo} (${t.semestre})`;
const nomesProfessores = (t) =>
  (t.professores ?? [])
    .map((p) => p.nome)
    .filter(Boolean)
    .join(', ') || '—';
const opcoesDisciplina = computed(() => [
  { valor: '', rotulo: 'Selecione…' },
  ...listaDisciplinas.value.map((d) => ({ valor: d._id, rotulo: d.nome })),
]);

const form = reactive({ disciplina: '', codigo: '', semestre: '' });
// professores selecionados (objetos de usuário, para a lista mostrar o nome)
const profsSel = ref([]);

function novo() {
  Object.assign(form, { disciplina: '', codigo: '', semestre: '' });
  profsSel.value = [];
  abrirForm();
}

function editar(t) {
  Object.assign(form, {
    disciplina: t.disciplina?._id ?? t.disciplina,
    codigo: t.codigo,
    semestre: t.semestre,
  });
  // shortcut: depende de GET /turmas trazer os professores populados (objetos com nome)
  profsSel.value = (t.professores ?? []).filter((p) => typeof p === 'object');
  abrirForm(t);
}

function enviar() {
  salvar({
    disciplina: form.disciplina,
    codigo: form.codigo,
    semestre: form.semestre,
    professores: profsSel.value.map((p) => p._id),
  });
}

function pedirExcluir(t) {
  pedirExclusao(
    t,
    `Excluir a turma “${rotuloTurma(t)}”? Não é possível se ela tiver matrículas ou conteúdo.`,
  );
}

const modalMatriculas = ref(false);
const turmaMatriculas = ref(null);
function abrirMatriculas(t) {
  turmaMatriculas.value = t;
  modalMatriculas.value = true;
}

onMounted(carregar);
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h1 class="text-2xl font-medium">Turmas</h1>
      <button type="button" class="btn-primario" @click="novo">Nova turma</button>
    </div>

    <p v-if="erro" role="alert" class="mt-4 text-sm text-red-700 dark:text-red-400">{{ erro }}</p>

    <div class="mt-6">
      <Tabela
        :colunas="['Turma', 'Professores', 'Ações']"
        :itens="itens"
        :carregando="carregando"
        vazio="Nenhuma turma cadastrada."
      >
        <template #default="{ item: t }">
          <td class="px-4 py-3 font-medium">{{ rotuloTurma(t) }}</td>
          <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ nomesProfessores(t) }}</td>
          <td class="whitespace-nowrap px-4 py-3 text-right">
            <BotaoSecundario @click="abrirMatriculas(t)">Matrículas</BotaoSecundario>
            <BotaoSecundario @click="editar(t)">Editar</BotaoSecundario>
            <BotaoSecundario perigo @click="pedirExcluir(t)">Excluir</BotaoSecundario>
          </td>
        </template>
      </Tabela>
    </div>

    <Modal v-model="modalForm" :titulo="editando ? 'Editar turma' : 'Nova turma'">
      <form class="space-y-4" @submit.prevent="enviar">
        <CampoSelect
          v-model="form.disciplina"
          label="Disciplina"
          :opcoes="opcoesDisciplina"
          required
          :erro="campos.disciplina"
        />
        <Campo v-model="form.codigo" label="Código (ex.: 7A)" required :erro="campos.codigo" />
        <Campo
          v-model="form.semestre"
          label="Semestre (ex.: 2/2026)"
          required
          :erro="campos.semestre"
        />
        <fieldset class="space-y-2">
          <legend class="mb-1 text-sm font-medium">Professores</legend>
          <SelecaoUsuarios v-model="profsSel" papel="professor" rotulo="professor" />
        </fieldset>
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

    <MatriculasTurma
      v-model="modalMatriculas"
      :turma-id="turmaMatriculas?._id"
      :rotulo="turmaMatriculas ? rotuloTurma(turmaMatriculas) : ''"
    />

    <ConfirmarExclusao
      v-model="modalExcluir"
      :texto="textoExclusao"
      :erro="erroExclusao"
      :enviando="excluindo"
      @confirmar="confirmarExclusao"
    />
  </section>
</template>

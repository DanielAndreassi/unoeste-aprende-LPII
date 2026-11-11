<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { cursos, disciplinas } from '../../api/admin';
import { useCrud } from '../../composables/useCrud';
import BotaoSecundario from '../../components/ui/BotaoSecundario.vue';
import Campo from '../../components/ui/Campo.vue';
import CampoSelect from '../../components/ui/CampoSelect.vue';
import Modal from '../../components/ui/Modal.vue';
import ConfirmarExclusao from '../../components/admin/ConfirmarExclusao.vue';
import Tabela from '../../components/admin/Tabela.vue';

const listaCursos = ref([]);

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
  // a lista precisa dos cursos para o select e para mostrar o nome do curso na tabela
  async listar() {
    const [d, c] = await Promise.all([disciplinas.listar(), cursos.listar()]);
    listaCursos.value = c;
    return d;
  },
  criar: disciplinas.criar,
  atualizar: disciplinas.atualizar,
  excluir: disciplinas.excluir,
});

const nomeCurso = (d) =>
  d.curso?.nome ?? listaCursos.value.find((c) => c._id === d.curso)?.nome ?? '—';
const opcoesCurso = computed(() => [
  { valor: '', rotulo: 'Selecione…' },
  ...listaCursos.value.map((c) => ({ valor: c._id, rotulo: c.nome })),
]);

const form = reactive({ nome: '', curso: '', cargaHoraria: '' });

function novo() {
  Object.assign(form, { nome: '', curso: '', cargaHoraria: '' });
  abrirForm();
}

function editar(d) {
  Object.assign(form, {
    nome: d.nome,
    curso: d.curso?._id ?? d.curso,
    cargaHoraria: d.cargaHoraria,
  });
  abrirForm(d);
}

function enviar() {
  salvar({ nome: form.nome, curso: form.curso, cargaHoraria: Number(form.cargaHoraria) });
}

function pedirExcluir(d) {
  pedirExclusao(d, `Excluir a disciplina “${d.nome}”? Não é possível se ela tiver turmas.`);
}

onMounted(carregar);
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h1 class="text-2xl font-medium">Disciplinas</h1>
      <button type="button" class="btn-primario" @click="novo">Nova disciplina</button>
    </div>

    <p v-if="erro" role="alert" class="mt-4 text-sm text-red-700 dark:text-red-400">{{ erro }}</p>

    <div class="mt-6">
      <Tabela
        :colunas="['Nome', 'Curso', 'Carga horária', 'Ações']"
        :itens="itens"
        :carregando="carregando"
        vazio="Nenhuma disciplina cadastrada."
      >
        <template #default="{ item: d }">
          <td class="px-4 py-3 font-medium">{{ d.nome }}</td>
          <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ nomeCurso(d) }}</td>
          <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ d.cargaHoraria }} h</td>
          <td class="whitespace-nowrap px-4 py-3 text-right">
            <BotaoSecundario @click="editar(d)">Editar</BotaoSecundario>
            <BotaoSecundario perigo @click="pedirExcluir(d)">Excluir</BotaoSecundario>
          </td>
        </template>
      </Tabela>
    </div>

    <Modal v-model="modalForm" :titulo="editando ? 'Editar disciplina' : 'Nova disciplina'">
      <form class="space-y-4" @submit.prevent="enviar">
        <Campo v-model="form.nome" label="Nome" required :erro="campos.nome" />
        <CampoSelect
          v-model="form.curso"
          label="Curso"
          :opcoes="opcoesCurso"
          required
          :erro="campos.curso"
        />
        <Campo
          v-model="form.cargaHoraria"
          label="Carga horária (horas)"
          type="number"
          min="0"
          step="1"
          required
          :erro="campos.cargaHoraria"
        />
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

<script setup>
import { onMounted, reactive } from 'vue';
import { cursos } from '../../api/admin';
import { useCrud } from '../../composables/useCrud';
import BotaoSecundario from '../../components/ui/BotaoSecundario.vue';
import Campo from '../../components/ui/Campo.vue';
import Modal from '../../components/ui/Modal.vue';
import ConfirmarExclusao from '../../components/admin/ConfirmarExclusao.vue';
import Tabela from '../../components/admin/Tabela.vue';

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
} = useCrud(cursos);

const form = reactive({ nome: '', sigla: '' });

function novo() {
  Object.assign(form, { nome: '', sigla: '' });
  abrirForm();
}

function editar(c) {
  Object.assign(form, { nome: c.nome, sigla: c.sigla });
  abrirForm(c);
}

function enviar() {
  salvar({ nome: form.nome, sigla: form.sigla });
}

function pedirExcluir(c) {
  pedirExclusao(c, `Excluir o curso “${c.nome}”? Não é possível se ele tiver disciplinas.`);
}

onMounted(carregar);
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h1 class="titulo-pagina">Cursos</h1>
      <button type="button" class="btn-primario" @click="novo">Novo curso</button>
    </div>

    <p v-if="erro" role="alert" class="mt-4 text-sm text-red-700 dark:text-red-400">{{ erro }}</p>

    <div class="mt-6">
      <Tabela
        :colunas="['Nome', 'Sigla', 'Ações']"
        :itens="itens"
        :carregando="carregando"
        vazio="Nenhum curso cadastrado."
      >
        <template #default="{ item: c }">
          <td class="px-4 py-3 font-medium">{{ c.nome }}</td>
          <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ c.sigla }}</td>
          <td class="whitespace-nowrap px-4 py-3 text-right">
            <BotaoSecundario @click="editar(c)">Editar</BotaoSecundario>
            <BotaoSecundario perigo @click="pedirExcluir(c)">Excluir</BotaoSecundario>
          </td>
        </template>
      </Tabela>
    </div>

    <Modal v-model="modalForm" :titulo="editando ? 'Editar curso' : 'Novo curso'">
      <form class="space-y-4" @submit.prevent="enviar">
        <Campo v-model="form.nome" label="Nome" required :erro="campos.nome" />
        <Campo
          v-model="form.sigla"
          label="Sigla (ex.: BACH-PRES-PP)"
          required
          :erro="campos.sigla"
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

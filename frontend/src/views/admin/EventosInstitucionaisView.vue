<script setup>
import { onMounted, reactive } from 'vue';
import { eventosInstitucionais } from '../../api/admin';
import { useCrud } from '../../composables/useCrud';
import { isoParaLocal, localParaIso, paraExibicao } from '../../utils/datas';
import BotaoSecundario from '../../components/ui/BotaoSecundario.vue';
import Campo from '../../components/ui/Campo.vue';
import CampoSelect from '../../components/ui/CampoSelect.vue';
import Modal from '../../components/ui/Modal.vue';
import ConfirmarExclusao from '../../components/admin/ConfirmarExclusao.vue';
import Tabela from '../../components/admin/Tabela.vue';

const TIPOS = {
  'aula-ao-vivo': 'Aula ao vivo',
  atividade: 'Atividade',
  prova: 'Prova',
  outro: 'Outro',
};
const opcoesTipo = Object.entries(TIPOS).map(([valor, rotulo]) => ({ valor, rotulo }));

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
} = useCrud(eventosInstitucionais);

const formVazio = () => ({ titulo: '', tipo: 'outro', link: '', inicio: '', fim: '' });
const form = reactive(formVazio());

function novo() {
  Object.assign(form, formVazio());
  abrirForm();
}

function editar(e) {
  Object.assign(form, {
    titulo: e.titulo,
    tipo: e.tipo,
    link: e.link ?? '',
    inicio: isoParaLocal(e.inicio),
    fim: isoParaLocal(e.fim),
  });
  abrirForm(e);
}

function enviar() {
  // valores no formato AAAA-MM-DDTHH:mm: a comparação de texto já ordena certo
  if (form.fim <= form.inicio) {
    erroForm.value = 'O fim deve ser depois do início.';
    return;
  }
  salvar({
    titulo: form.titulo,
    tipo: form.tipo,
    link: form.link.trim() || null,
    inicio: localParaIso(form.inicio),
    fim: localParaIso(form.fim),
  });
}

function pedirExcluir(e) {
  pedirExclusao(e, `Excluir o evento “${e.titulo}”?`);
}

onMounted(carregar);
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h1 class="titulo-pagina">Eventos institucionais</h1>
      <button type="button" class="btn-primario" @click="novo">Novo evento</button>
    </div>
    <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
      Horários em São Paulo. Aparecem no calendário de todos os usuários.
    </p>

    <p v-if="erro" role="alert" class="mt-4 text-sm text-red-700 dark:text-red-400">{{ erro }}</p>

    <div class="mt-6">
      <Tabela
        :colunas="['Título', 'Tipo', 'Início', 'Fim', 'Ações']"
        :itens="itens"
        :carregando="carregando"
        vazio="Nenhum evento institucional cadastrado."
      >
        <template #default="{ item: e }">
          <td class="px-4 py-3 font-medium">{{ e.titulo }}</td>
          <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ TIPOS[e.tipo] ?? e.tipo }}</td>
          <td class="whitespace-nowrap px-4 py-3">{{ paraExibicao(e.inicio) }}</td>
          <td class="whitespace-nowrap px-4 py-3">{{ paraExibicao(e.fim) }}</td>
          <td class="whitespace-nowrap px-4 py-3 text-right">
            <BotaoSecundario @click="editar(e)">Editar</BotaoSecundario>
            <BotaoSecundario perigo @click="pedirExcluir(e)">Excluir</BotaoSecundario>
          </td>
        </template>
      </Tabela>
    </div>

    <Modal v-model="modalForm" :titulo="editando ? 'Editar evento' : 'Novo evento'">
      <form class="space-y-4" @submit.prevent="enviar">
        <Campo v-model="form.titulo" label="Título" required :erro="campos.titulo" />
        <CampoSelect v-model="form.tipo" label="Tipo" :opcoes="opcoesTipo" :erro="campos.tipo" />
        <Campo
          v-model="form.link"
          label="Link (opcional)"
          type="url"
          placeholder="https://"
          :erro="campos.link"
        />
        <Campo
          v-model="form.inicio"
          label="Início"
          type="datetime-local"
          required
          :erro="campos.inicio"
        />
        <Campo v-model="form.fim" label="Fim" type="datetime-local" required :erro="campos.fim" />
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

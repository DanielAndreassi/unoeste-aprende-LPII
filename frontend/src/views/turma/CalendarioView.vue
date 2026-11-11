<script setup>
import { reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  atualizarEvento,
  criarEventoTurma,
  excluirEvento,
  listarEventosTurma,
} from '../../api/eventos';
import { useCrud } from '../../composables/useCrud';
import { useAuthStore } from '../../stores/auth';
import { isoParaLocal, localParaIso } from '../../utils/datas';
import { TIPOS } from '../../components/calendario/tipos';
import CalendarioMes from '../../components/calendario/CalendarioMes.vue';
import BotaoSecundario from '../../components/ui/BotaoSecundario.vue';
import Campo from '../../components/ui/Campo.vue';
import CampoSelect from '../../components/ui/CampoSelect.vue';
import Modal from '../../components/ui/Modal.vue';
import ConfirmarExclusao from '../../components/admin/ConfirmarExclusao.vue';

const route = useRoute();
const auth = useAuthStore();
const turmaId = route.params.id;
const podeEditar = auth.role === 'professor';
const opcoesTipo = Object.entries(TIPOS).map(([valor, t]) => ({ valor, rotulo: t.rotulo }));

// Período visível (mandado pela grade do mês). Sem ele não há o que listar.
const periodo = ref(null);

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
  listar: () => (periodo.value ? listarEventosTurma(turmaId, periodo.value) : []),
  criar: (corpo) => criarEventoTurma(turmaId, corpo),
  atualizar: (id, corpo) => atualizarEvento(id, corpo),
  excluir: excluirEvento,
});

function mudouPeriodo(p) {
  periodo.value = p;
  carregar();
}

const formVazio = () => ({ titulo: '', tipo: 'atividade', link: '', inicio: '', fim: '' });
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
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h1 class="titulo-pagina">Calendário</h1>
      <button v-if="podeEditar" type="button" class="btn-primario" @click="novo">
        Novo evento
      </button>
    </div>
    <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
      Eventos desta disciplina. Horários em São Paulo.
    </p>

    <p v-if="erro" role="alert" class="mt-4 text-sm text-red-700 dark:text-red-400">{{ erro }}</p>

    <div class="painel mt-6 p-4 sm:p-6" :aria-busy="carregando">
      <CalendarioMes :eventos="itens" @periodo="mudouPeriodo">
        <template #acoes="{ evento, fechar }">
          <template v-if="podeEditar">
            <BotaoSecundario
              class="border"
              @click="
                fechar();
                editar(evento);
              "
              >Editar</BotaoSecundario
            >
            <BotaoSecundario
              perigo
              @click="
                fechar();
                pedirExcluir(evento);
              "
              >Excluir</BotaoSecundario
            >
          </template>
        </template>
      </CalendarioMes>
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

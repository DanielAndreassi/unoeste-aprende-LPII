<script setup>
import { onMounted, reactive, ref } from 'vue';
import { usuarios } from '../../api/admin';
import { useCrud } from '../../composables/useCrud';
import { useAuthStore } from '../../stores/auth';
import Avatar from '../../components/ui/Avatar.vue';
import BotaoSecundario from '../../components/ui/BotaoSecundario.vue';
import Campo from '../../components/ui/Campo.vue';
import CampoSelect from '../../components/ui/CampoSelect.vue';
import Modal from '../../components/ui/Modal.vue';
import ConfirmarExclusao from '../../components/admin/ConfirmarExclusao.vue';
import Tabela from '../../components/admin/Tabela.vue';

const auth = useAuthStore();
const PAPEIS = { admin: 'Admin', professor: 'Professor', aluno: 'Aluno' };
const SELOS = {
  admin: 'bg-primary-800 text-white',
  professor: 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100',
  aluno: 'bg-primary-50 text-primary-900 dark:bg-primary-900/40 dark:text-primary-100',
};
const opcoesPapel = Object.entries(PAPEIS).map(([valor, rotulo]) => ({ valor, rotulo }));

const q = ref('');
const page = ref(1);
const paginas = ref(1);
const total = ref(0);

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
  async listar() {
    const r = await usuarios.listar({ page: page.value, q: q.value || undefined });
    paginas.value = r.paginas;
    total.value = r.total;
    return r.itens;
  },
  criar: usuarios.criar,
  atualizar: usuarios.atualizar,
  excluir: usuarios.desativar,
});

const formVazio = () => ({ nome: '', email: '', role: 'aluno', ativo: true });
const form = reactive(formVazio());

function novo() {
  Object.assign(form, formVazio());
  abrirForm();
}

function editar(u) {
  Object.assign(form, { nome: u.nome, email: u.email, role: u.role, ativo: u.ativo });
  abrirForm(u);
}

function enviar() {
  const { nome, email, role, ativo } = form;
  // sem senha na criação: a API manda o e-mail de boas-vindas (ADR-0012)
  salvar(editando.value ? { nome, email, role, ativo } : { nome, email, role });
}

function buscar() {
  page.value = 1;
  carregar();
}

function irPagina(delta) {
  page.value += delta;
  carregar();
}

// Usuário nunca é apagado: DELETE da API desativa (ADR-0012)
function pedirDesativar(u) {
  pedirExclusao(
    u,
    `A conta de ${u.nome} será desativada: o login fica bloqueado e o histórico é mantido.`,
    { titulo: 'Desativar usuário', rotulo: 'Desativar' },
  );
}

onMounted(carregar);
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h1 class="text-2xl font-medium">Usuários</h1>
      <button type="button" class="btn-primario" @click="novo">Novo usuário</button>
    </div>

    <form role="search" class="mt-4 flex items-end gap-2" @submit.prevent="buscar">
      <div class="min-w-0 max-w-md flex-1">
        <Campo v-model="q" label="Buscar por nome ou e-mail" type="search" />
      </div>
      <button type="submit" class="btn-primario shrink-0">Buscar</button>
    </form>

    <p v-if="erro" role="alert" class="mt-4 text-sm text-red-700 dark:text-red-400">{{ erro }}</p>

    <div class="mt-4">
      <Tabela
        :colunas="['Nome', 'E-mail', 'Papel', 'Situação', 'Ações']"
        :itens="itens"
        :carregando="carregando"
        vazio="Nenhum usuário encontrado."
      >
        <template #default="{ item: u }">
          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <Avatar :usuario="u" />
              <span class="font-medium">{{ u.nome }}</span>
            </div>
          </td>
          <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ u.email }}</td>
          <td class="px-4 py-3">
            <span :class="['rounded-full px-2.5 py-0.5 text-xs font-medium', SELOS[u.role]]">{{
              PAPEIS[u.role]
            }}</span>
          </td>
          <td class="px-4 py-3">
            <span :class="u.ativo ? '' : 'text-gray-500 dark:text-gray-400'">
              {{ u.ativo ? 'Ativo' : 'Inativo' }}
            </span>
          </td>
          <td class="whitespace-nowrap px-4 py-3 text-right">
            <BotaoSecundario @click="editar(u)">Editar</BotaoSecundario>
            <BotaoSecundario
              v-if="u.ativo && u._id !== auth.usuario?._id"
              perigo
              @click="pedirDesativar(u)"
            >
              Desativar
            </BotaoSecundario>
          </td>
        </template>
      </Tabela>
    </div>

    <nav
      v-if="paginas > 1"
      aria-label="Paginação"
      class="mt-4 flex items-center justify-between gap-2 text-sm"
    >
      <BotaoSecundario class="border" :disabled="page <= 1" @click="irPagina(-1)">
        Anterior
      </BotaoSecundario>
      <span>Página {{ page }} de {{ paginas }} · {{ total }} usuários</span>
      <BotaoSecundario class="border" :disabled="page >= paginas" @click="irPagina(1)">
        Próxima
      </BotaoSecundario>
    </nav>

    <Modal v-model="modalForm" :titulo="editando ? 'Editar usuário' : 'Novo usuário'">
      <form class="space-y-4" @submit.prevent="enviar">
        <Campo v-model="form.nome" label="Nome" required :erro="campos.nome" />
        <Campo
          v-model="form.email"
          label="E-mail"
          type="email"
          autocomplete="off"
          required
          :erro="campos.email"
        />
        <CampoSelect v-model="form.role" label="Papel" :opcoes="opcoesPapel" :erro="campos.role" />
        <label v-if="editando" class="flex items-center gap-2 text-sm">
          <input v-model="form.ativo" type="checkbox" class="size-4 accent-primary-800" />
          Conta ativa (desmarque para bloquear o login)
        </label>
        <p v-else class="text-sm text-gray-600 dark:text-gray-400">
          Um e-mail de boas-vindas, com link para definir a senha, será enviado.
        </p>
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

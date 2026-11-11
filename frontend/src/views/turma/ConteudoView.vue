<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import * as api from '../../api/conteudo';
import { mensagemErro } from '../../api/http';
import { useAuthStore } from '../../stores/auth';
import BotaoSecundario from '../../components/ui/BotaoSecundario.vue';
import Campo from '../../components/ui/Campo.vue';
import Modal from '../../components/ui/Modal.vue';
import FormMaterial from '../../components/conteudo/FormMaterial.vue';
import MaterialItem from '../../components/conteudo/MaterialItem.vue';

const route = useRoute();
const auth = useAuthStore();
const turmaId = route.params.id;
const podeEditar = auth.role === 'professor';
const podeConcluir = auth.role === 'aluno';

const topicos = ref([]);
const carregando = ref(true);
const erro = ref('');
const avisoProgresso = ref('');
const editando = ref(false);
const recolhidos = ref({}); // id do tópico → true

async function carregar() {
  try {
    topicos.value = await api.arvore(turmaId);
    erro.value = '';
  } catch (err) {
    erro.value = mensagemErro(err);
  } finally {
    carregando.value = false;
  }
}
onMounted(carregar);

// --- reordenar (↑/↓): troca de lugar e envia a lista inteira dos irmãos ---
async function mover(lista, i, delta, nivel, pai) {
  const j = i + delta;
  if (j < 0 || j >= lista.length) return;
  [lista[i], lista[j]] = [lista[j], lista[i]];
  try {
    await api.reordenar(
      turmaId,
      nivel,
      pai,
      lista.map((x) => x._id),
    );
  } catch (err) {
    erro.value = mensagemErro(err);
    await carregar();
  }
}

// --- modal de título (tópico e seção) ---
const modalTitulo = ref(false);
const formTitulo = ref({ rotulo: '', valor: '', salvar: null });
const erroTitulo = ref('');

function abrirTitulo(rotulo, valor, salvar) {
  formTitulo.value = { rotulo, valor, salvar };
  erroTitulo.value = '';
  modalTitulo.value = true;
}

async function enviarTitulo() {
  try {
    await formTitulo.value.salvar(formTitulo.value.valor);
    modalTitulo.value = false;
    await carregar();
  } catch (err) {
    erroTitulo.value = err.response?.data?.campos?.titulo ?? mensagemErro(err);
  }
}

// --- modal de material ---
const modalMaterial = ref(false);
const formMaterial = ref({ secaoId: null, material: null });

function abrirMaterial(secaoId, material = null) {
  formMaterial.value = { secaoId, material };
  modalMaterial.value = true;
}

async function materialSalvo() {
  modalMaterial.value = false;
  await carregar();
}

// --- confirmação de exclusão ---
const modalExcluir = ref(false);
const exclusao = ref({ mensagem: '', executar: null });

function confirmarExclusao(mensagem, executar) {
  exclusao.value = { mensagem, executar };
  modalExcluir.value = true;
}

async function excluir() {
  modalExcluir.value = false;
  try {
    await exclusao.value.executar();
    await carregar();
  } catch (err) {
    erro.value = mensagemErro(err);
  }
}

// --- progresso do aluno: a marcação muda na hora e volta se a API recusar ---
const todosMateriais = computed(() =>
  topicos.value.flatMap((t) => t.secoes.flatMap((s) => s.materiais)),
);
const totalMateriais = computed(() => todosMateriais.value.length);
const concluidos = computed(() => todosMateriais.value.filter((m) => m.concluido).length);
const percentual = computed(() =>
  totalMateriais.value ? Math.round((concluidos.value / totalMateriais.value) * 100) : 0,
);

async function marcar(material, concluido) {
  const anterior = material.concluido;
  material.concluido = concluido;
  avisoProgresso.value = '';
  try {
    if (concluido) await api.marcarConcluido(material._id);
    else await api.desmarcarConcluido(material._id);
  } catch (err) {
    material.concluido = anterior;
    avisoProgresso.value = `Não foi possível atualizar “${material.titulo}”. ${mensagemErro(err)}`;
  }
}
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h1 class="titulo-pagina">Conteúdo</h1>
      <div v-if="podeEditar" class="flex gap-2">
        <BotaoSecundario
          v-if="editando"
          class="border"
          @click="abrirTitulo('Título do tópico', '', (t) => api.criarTopico(turmaId, t))"
        >
          Novo tópico
        </BotaoSecundario>
        <BotaoSecundario
          :aria-pressed="editando"
          :class="[
            'border',
            editando && 'bg-primary-100 text-primary-900 dark:bg-gray-800 dark:text-primary-300',
          ]"
          @click="editando = !editando"
        >
          Modo edição
        </BotaoSecundario>
      </div>
    </div>

    <div v-if="podeConcluir && totalMateriais" class="mt-4">
      <div class="flex justify-between gap-2 text-sm">
        <span>Seu progresso nesta disciplina</span>
        <span class="tabular-nums"
          >{{ concluidos }} de {{ totalMateriais }} · {{ percentual }}%</span
        >
      </div>
      <div
        role="progressbar"
        aria-label="Progresso da disciplina"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="percentual"
        class="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800"
      >
        <div
          class="h-full rounded-full bg-primary-700 transition-all"
          :style="{ width: `${percentual}%` }"
        />
      </div>
    </div>

    <p v-if="erro" role="alert" class="mt-4 text-sm text-red-700 dark:text-red-400">{{ erro }}</p>
    <p v-if="avisoProgresso" role="alert" class="mt-4 text-sm text-red-700 dark:text-red-400">
      {{ avisoProgresso }}
    </p>

    <div v-if="carregando" class="mt-6 space-y-4" aria-busy="true">
      <div
        v-for="n in 2"
        :key="n"
        class="h-28 animate-pulse rounded-xl border bg-white dark:bg-gray-900"
      />
    </div>

    <p
      v-else-if="!topicos.length && !erro"
      class="mt-6 rounded-xl border bg-white p-6 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-400"
    >
      {{
        podeEditar
          ? 'Esta disciplina ainda não tem conteúdo. Ative o modo edição para criar o primeiro tópico.'
          : 'O professor ainda não publicou conteúdo nesta disciplina.'
      }}
    </p>

    <div v-else class="mt-6 space-y-4">
      <article
        v-for="(topico, ti) in topicos"
        :key="topico._id"
        class="rounded-xl border bg-white shadow-sm dark:bg-gray-900"
      >
        <header class="flex items-center gap-2 p-2 pl-4">
          <button
            type="button"
            class="flex h-10 min-w-0 flex-1 items-center gap-2 text-left text-lg font-medium"
            :aria-expanded="!recolhidos[topico._id]"
            @click="recolhidos[topico._id] = !recolhidos[topico._id]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              :class="['shrink-0 transition-transform', recolhidos[topico._id] && '-rotate-90']"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
            <span class="truncate">{{ topico.titulo }}</span>
          </button>
          <div v-if="editando" class="flex shrink-0 flex-wrap justify-end">
            <BotaoSecundario
              :disabled="ti === 0"
              aria-label="Mover tópico para cima"
              @click="mover(topicos, ti, -1, 'topicos')"
              >↑</BotaoSecundario
            >
            <BotaoSecundario
              :disabled="ti === topicos.length - 1"
              aria-label="Mover tópico para baixo"
              @click="mover(topicos, ti, 1, 'topicos')"
              >↓</BotaoSecundario
            >
            <BotaoSecundario
              @click="
                abrirTitulo('Título do tópico', topico.titulo, (t) =>
                  api.atualizarTopico(topico._id, t),
                )
              "
              >Editar</BotaoSecundario
            >
            <BotaoSecundario
              perigo
              @click="
                confirmarExclusao(
                  `Excluir o tópico “${topico.titulo}”? Todas as seções, materiais e arquivos dele serão apagados.`,
                  () => api.excluirTopico(topico._id),
                )
              "
            >
              Excluir
            </BotaoSecundario>
          </div>
        </header>

        <div v-show="!recolhidos[topico._id]" class="space-y-6 border-t p-4">
          <p
            v-if="!topico.secoes.length && !editando"
            class="text-sm text-gray-500 dark:text-gray-400"
          >
            Nenhuma seção.
          </p>

          <section v-for="(secao, si) in topico.secoes" :key="secao._id">
            <div class="flex items-center gap-2">
              <h3 class="min-w-0 flex-1 truncate font-medium">{{ secao.titulo }}</h3>
              <div v-if="editando" class="flex shrink-0 flex-wrap justify-end">
                <BotaoSecundario
                  :disabled="si === 0"
                  aria-label="Mover seção para cima"
                  @click="mover(topico.secoes, si, -1, 'secoes', topico._id)"
                  >↑</BotaoSecundario
                >
                <BotaoSecundario
                  :disabled="si === topico.secoes.length - 1"
                  aria-label="Mover seção para baixo"
                  @click="mover(topico.secoes, si, 1, 'secoes', topico._id)"
                  >↓</BotaoSecundario
                >
                <BotaoSecundario @click="abrirMaterial(secao._id)">Novo material</BotaoSecundario>
                <BotaoSecundario
                  @click="
                    abrirTitulo('Título da seção', secao.titulo, (t) =>
                      api.atualizarSecao(secao._id, t),
                    )
                  "
                  >Editar</BotaoSecundario
                >
                <BotaoSecundario
                  perigo
                  @click="
                    confirmarExclusao(
                      `Excluir a seção “${secao.titulo}”? Todos os materiais e arquivos dela serão apagados.`,
                      () => api.excluirSecao(secao._id),
                    )
                  "
                >
                  Excluir
                </BotaoSecundario>
              </div>
            </div>

            <ul v-if="secao.materiais.length" class="mt-1 divide-y">
              <MaterialItem
                v-for="(material, mi) in secao.materiais"
                :key="material._id"
                :material="material"
                :editando="editando"
                :pode-concluir="podeConcluir"
                :primeiro="mi === 0"
                :ultimo="mi === secao.materiais.length - 1"
                @subir="mover(secao.materiais, mi, -1, 'materiais', secao._id)"
                @descer="mover(secao.materiais, mi, 1, 'materiais', secao._id)"
                @editar="abrirMaterial(secao._id, material)"
                @excluir="
                  confirmarExclusao(`Excluir o material “${material.titulo}”?`, () =>
                    api.excluirMaterial(material._id),
                  )
                "
                @erro="erro = $event"
                @concluir="marcar(material, $event)"
              />
            </ul>
            <p v-else class="mt-1 text-sm text-gray-500 dark:text-gray-400">Nenhum material.</p>
          </section>

          <BotaoSecundario
            v-if="editando"
            class="border"
            @click="abrirTitulo('Título da seção', '', (t) => api.criarSecao(topico._id, t))"
          >
            Nova seção
          </BotaoSecundario>
        </div>
      </article>
    </div>

    <Modal v-model="modalTitulo" :titulo="formTitulo.rotulo">
      <form class="space-y-4" @submit.prevent="enviarTitulo">
        <Campo v-model="formTitulo.valor" label="Título" required :erro="erroTitulo" />
        <div class="flex justify-end gap-2">
          <BotaoSecundario @click="modalTitulo = false">Cancelar</BotaoSecundario>
          <button type="submit" class="btn-primario">Salvar</button>
        </div>
      </form>
    </Modal>

    <Modal
      v-model="modalMaterial"
      :titulo="formMaterial.material ? 'Editar material' : 'Novo material'"
    >
      <FormMaterial
        :secao-id="formMaterial.secaoId"
        :material="formMaterial.material"
        @salvo="materialSalvo"
        @cancelar="modalMaterial = false"
      />
    </Modal>

    <Modal v-model="modalExcluir" titulo="Confirmar exclusão">
      <p class="text-sm">{{ exclusao.mensagem }}</p>
      <div class="mt-4 flex justify-end gap-2">
        <BotaoSecundario @click="modalExcluir = false">Cancelar</BotaoSecundario>
        <button type="button" class="btn-primario bg-red-700 hover:bg-red-800" @click="excluir">
          Excluir
        </button>
      </div>
    </Modal>
  </section>
</template>

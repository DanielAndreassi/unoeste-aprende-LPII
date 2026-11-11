<script setup>
import { ref } from 'vue';
import { atualizarMaterial, criarMaterial } from '../../api/conteudo';
import { mensagemErro } from '../../api/http';
import Campo from '../ui/Campo.vue';
import BotaoSecundario from '../ui/BotaoSecundario.vue';

// Cria (secaoId) ou edita (material) um material. Na edição o tipo e o arquivo não mudam (api.md).
const props = defineProps({ secaoId: String, material: Object });
const emit = defineEmits(['salvo', 'cancelar']);

const m = props.material;
const tipo = ref(m?.tipo ?? 'link');
const titulo = ref(m?.titulo ?? '');
const descricao = ref(m?.descricao ?? '');
const url = ref(m?.url ?? '');
const conteudo = ref(m?.conteudo ?? '');
const arquivo = ref(null);
const campos = ref({});
const erro = ref('');
const enviando = ref(false);

// classes iguais às do Campo
const entrada =
  'w-full rounded-lg border border-gray-300 bg-white px-3 text-sm transition-colors hover:border-gray-400 focus-visible:border-primary-700 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600 dark:focus-visible:border-primary-400';

function corpo() {
  if (m) {
    return {
      titulo: titulo.value,
      descricao: descricao.value,
      url: url.value,
      conteudo: conteudo.value,
    };
  }
  if (tipo.value === 'arquivo') {
    const f = new FormData();
    f.append('tipo', 'arquivo');
    f.append('titulo', titulo.value);
    f.append('descricao', descricao.value);
    if (arquivo.value) f.append('arquivo', arquivo.value);
    return f;
  }
  return {
    tipo: tipo.value,
    titulo: titulo.value,
    descricao: descricao.value,
    url: url.value,
    conteudo: conteudo.value,
  };
}

async function salvar() {
  campos.value = {};
  erro.value = '';
  enviando.value = true;
  try {
    if (m) await atualizarMaterial(m._id, corpo());
    else await criarMaterial(props.secaoId, corpo());
    emit('salvo');
  } catch (err) {
    campos.value = err.response?.data?.campos ?? {};
    if (!Object.keys(campos.value).length) erro.value = mensagemErro(err);
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="salvar">
    <div v-if="!m">
      <label for="tipo-material" class="mb-1 block text-sm font-medium">Tipo</label>
      <select id="tipo-material" v-model="tipo" :class="[entrada, 'h-11 sm:h-10']">
        <option value="link">Link</option>
        <option value="arquivo">Arquivo</option>
        <option value="texto">Texto</option>
      </select>
    </div>

    <Campo v-model="titulo" label="Título" required :erro="campos.titulo" />

    <div>
      <label for="descricao-material" class="mb-1 block text-sm font-medium"
        >Descrição (opcional)</label
      >
      <textarea id="descricao-material" v-model="descricao" rows="2" :class="[entrada, 'py-2']" />
    </div>

    <Campo
      v-if="tipo === 'link'"
      v-model="url"
      label="Endereço (URL)"
      type="url"
      placeholder="https://"
      required
      :erro="campos.url"
    />

    <div v-if="tipo === 'texto'">
      <label for="conteudo-material" class="mb-1 block text-sm font-medium"
        >Conteúdo (Markdown)</label
      >
      <textarea
        id="conteudo-material"
        v-model="conteudo"
        rows="8"
        required
        :aria-invalid="!!campos.conteudo"
        :class="[entrada, 'py-2 aria-invalid:border-red-600']"
      />
      <p v-if="campos.conteudo" class="mt-1 text-sm text-red-700 dark:text-red-400">
        {{ campos.conteudo }}
      </p>
    </div>

    <div v-if="tipo === 'arquivo' && !m">
      <label for="arquivo-material" class="mb-1 block text-sm font-medium">Arquivo</label>
      <input
        id="arquivo-material"
        type="file"
        accept=".pdf,.zip,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg"
        class="block w-full text-sm file:mr-3 file:h-11 sm:file:h-10 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:text-sm file:font-medium file:transition-colors hover:file:bg-gray-200 dark:file:bg-gray-800 dark:hover:file:bg-gray-700"
        @change="arquivo = $event.target.files[0] ?? null"
      />
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        pdf, zip, doc, ppt, xls, txt, png ou jpg, até 20 MB
      </p>
      <p v-if="campos.arquivo" class="mt-1 text-sm text-red-700 dark:text-red-400">
        {{ campos.arquivo }}
      </p>
    </div>

    <p v-if="erro" role="alert" class="text-sm text-red-700 dark:text-red-400">{{ erro }}</p>

    <div class="flex justify-end gap-2">
      <BotaoSecundario @click="emit('cancelar')">Cancelar</BotaoSecundario>
      <button type="submit" class="btn-primario" :disabled="enviando">
        {{ enviando ? 'Salvando…' : 'Salvar' }}
      </button>
    </div>
  </form>
</template>

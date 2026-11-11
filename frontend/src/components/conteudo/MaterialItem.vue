<script setup>
import { ref } from 'vue';
import { baixarMaterial } from '../../api/conteudo';
import BotaoSecundario from '../ui/BotaoSecundario.vue';
import IconeMaterial from '../ui/IconeMaterial.vue';
import MarkdownView from '../ui/MarkdownView.vue';

const props = defineProps({
  material: { type: Object, required: true },
  editando: Boolean,
  primeiro: Boolean,
  ultimo: Boolean,
  podeConcluir: Boolean, // só aluno (progresso manual, regras-negocio.md › Progresso)
});
const emit = defineEmits(['editar', 'excluir', 'subir', 'descer', 'erro', 'concluir']);

const lendo = ref(false);
const baixando = ref(false);

function tamanho(bytes) {
  return bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function baixar() {
  baixando.value = true;
  try {
    await baixarMaterial(props.material);
  } catch {
    emit('erro', 'Não foi possível baixar o arquivo');
  } finally {
    baixando.value = false;
  }
}
</script>

<template>
  <li class="py-3">
    <div class="flex items-start gap-3">
      <IconeMaterial :material="material" class="mt-0.5" />

      <div class="min-w-0 flex-1">
        <a
          v-if="material.tipo === 'link'"
          :href="material.url"
          target="_blank"
          rel="noopener noreferrer"
          class="link break-words"
        >
          {{ material.titulo }}
        </a>
        <button
          v-else-if="material.tipo === 'arquivo'"
          type="button"
          class="link break-words text-left disabled:opacity-60"
          :disabled="baixando"
          @click="baixar"
        >
          {{ material.titulo }}
        </button>
        <button
          v-else
          type="button"
          class="link break-words text-left"
          :aria-expanded="lendo"
          @click="lendo = !lendo"
        >
          {{ material.titulo }}
        </button>

        <p v-if="material.tipo === 'arquivo'" class="text-sm text-gray-500 dark:text-gray-400">
          {{ material.arquivo.nome }} · {{ tamanho(material.arquivo.tamanho) }}
        </p>
        <p v-if="material.descricao" class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {{ material.descricao }}
        </p>
      </div>

      <label
        v-if="podeConcluir && !editando"
        class="flex shrink-0 cursor-pointer items-center gap-2 text-sm"
      >
        <input
          type="checkbox"
          class="size-4 accent-primary-800"
          :checked="!!material.concluido"
          @change="emit('concluir', $event.target.checked)"
        />
        Concluído
      </label>

      <div v-if="editando" class="flex shrink-0 flex-wrap justify-end">
        <BotaoSecundario :disabled="primeiro" aria-label="Mover para cima" @click="emit('subir')"
          >↑</BotaoSecundario
        >
        <BotaoSecundario :disabled="ultimo" aria-label="Mover para baixo" @click="emit('descer')"
          >↓</BotaoSecundario
        >
        <BotaoSecundario @click="emit('editar')">Editar</BotaoSecundario>
        <BotaoSecundario perigo @click="emit('excluir')">Excluir</BotaoSecundario>
      </div>
    </div>

    <MarkdownView
      v-if="material.tipo === 'texto' && lendo"
      :conteudo="material.conteudo"
      class="mt-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
    />
  </li>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { usuarios } from '../../api/admin';
import { mensagemErro } from '../../api/http';
import Campo from '../ui/Campo.vue';

// Busca usuários de um papel (/usuarios?q=) e marca quem entra na seleção (v-model: lista de usuários).
// `excluidos` = ids que não devem aparecer (ex.: alunos já matriculados).
const props = defineProps({
  papel: String,
  rotulo: String,
  excluidos: { type: Array, default: () => [] },
});
const selecionados = defineModel({ default: () => [] });
const busca = ref('');
const resultados = ref([]);
const erro = ref('');

// Selecionados aparecem sempre, mesmo fora da busca atual, para dar para desmarcar.
const visiveis = computed(() => {
  const marcados = new Set(selecionados.value.map((u) => u._id));
  return [
    ...selecionados.value,
    ...resultados.value.filter((u) => !marcados.has(u._id) && !props.excluidos.includes(u._id)),
  ];
});

const marcado = (u) => selecionados.value.some((s) => s._id === u._id);

function alternar(u) {
  selecionados.value = marcado(u)
    ? selecionados.value.filter((s) => s._id !== u._id)
    : [...selecionados.value, u];
}

async function buscar() {
  erro.value = '';
  try {
    const r = await usuarios.listar({ q: busca.value || undefined });
    // shortcut: filtra por papel no cliente porque a API de /usuarios não tem filtro de papel; só vê a primeira página.
    resultados.value = r.itens.filter((u) => u.role === props.papel && u.ativo);
  } catch (err) {
    erro.value = mensagemErro(err);
  }
}

onMounted(buscar);
</script>

<template>
  <div class="space-y-2">
    <form role="search" class="flex items-end gap-2" @submit.prevent="buscar">
      <div class="min-w-0 flex-1">
        <Campo
          v-model="busca"
          :label="`Buscar ${rotulo}`"
          type="search"
          placeholder="Nome ou e-mail"
        />
      </div>
      <button type="submit" class="btn-primario shrink-0">Buscar</button>
    </form>
    <p v-if="erro" role="alert" class="text-sm text-red-700 dark:text-red-400">{{ erro }}</p>
    <ul class="max-h-56 space-y-1 overflow-y-auto rounded-lg border p-2">
      <li v-for="u in visiveis" :key="u._id">
        <label
          class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <input
            type="checkbox"
            class="size-4 accent-primary-800"
            :checked="marcado(u)"
            @change="alternar(u)"
          />
          <span class="min-w-0 truncate">
            {{ u.nome }}
            <span class="text-gray-500 dark:text-gray-400">· {{ u.email }}</span>
          </span>
        </label>
      </li>
    </ul>
    <p v-if="!visiveis.length" class="text-sm text-gray-500 dark:text-gray-400">
      Nenhum {{ rotulo }} encontrado.
    </p>
  </div>
</template>

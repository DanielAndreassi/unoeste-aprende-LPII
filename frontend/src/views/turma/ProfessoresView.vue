<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { mensagemErro } from '../../api/http';
import { participantes } from '../../api/turmas';
import Avatar from '../../components/ui/Avatar.vue';

const professores = ref(null);
const erro = ref('');

participantes(useRoute().params.id)
  .then((r) => (professores.value = r.professores))
  .catch((err) => (erro.value = mensagemErro(err)));
</script>

<template>
  <section>
    <h1 class="text-2xl font-medium">Professores</h1>
    <p v-if="erro" role="alert" class="mt-4 text-sm text-red-700 dark:text-red-400">{{ erro }}</p>
    <p
      v-else-if="professores && !professores.length"
      class="mt-4 text-sm text-gray-600 dark:text-gray-400"
    >
      Nenhum professor associado à turma.
    </p>
    <ul v-else-if="professores" class="mt-4 grid gap-3 sm:grid-cols-2">
      <li
        v-for="p in professores"
        :key="p._id"
        class="flex items-center gap-3 rounded-xl border bg-white p-4 dark:bg-gray-900"
      >
        <Avatar :usuario="p" tamanho="h-12 w-12" />
        <div class="min-w-0">
          <p class="truncate font-medium">{{ p.nome }}</p>
          <p class="truncate text-sm text-gray-600 dark:text-gray-400">{{ p.email }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>

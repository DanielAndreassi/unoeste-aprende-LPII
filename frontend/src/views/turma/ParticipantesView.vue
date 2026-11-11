<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { mensagemErro } from '../../api/http';
import { participantes } from '../../api/turmas';
import Avatar from '../../components/ui/Avatar.vue';

const alunos = ref(null);
const erro = ref('');

participantes(useRoute().params.id)
  .then((r) => (alunos.value = r.alunos))
  .catch((err) => (erro.value = mensagemErro(err)));
</script>

<template>
  <section>
    <h1 class="text-2xl font-medium">Participantes</h1>
    <p v-if="erro" role="alert" class="mt-4 text-sm text-red-700 dark:text-red-400">{{ erro }}</p>
    <p v-else-if="alunos && !alunos.length" class="mt-4 text-sm text-gray-600 dark:text-gray-400">
      Nenhum aluno matriculado.
    </p>
    <template v-else-if="alunos">
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ alunos.length }} alunos</p>
      <ul class="mt-4 grid gap-3 sm:grid-cols-2">
        <li
          v-for="a in alunos"
          :key="a._id"
          class="flex items-center gap-3 rounded-xl border bg-white p-4 dark:bg-gray-900"
        >
          <Avatar :usuario="a" tamanho="h-10 w-10" />
          <div class="min-w-0 flex-1">
            <p class="truncate font-medium">{{ a.nome }}</p>
            <p class="truncate text-sm text-gray-600 dark:text-gray-400">{{ a.email }}</p>
            <!-- progresso só vem para o professor -->
            <div v-if="a.progresso !== undefined" class="mt-2 flex items-center gap-2">
              <div
                class="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
                role="progressbar"
                :aria-valuenow="a.progresso"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-label="`Progresso de ${a.nome}`"
              >
                <div
                  class="h-full bg-primary-800 dark:bg-primary-400"
                  :style="{ width: `${a.progresso}%` }"
                />
              </div>
              <span class="w-10 text-right text-xs tabular-nums">{{ a.progresso }}%</span>
            </div>
          </div>
        </li>
      </ul>
    </template>
  </section>
</template>

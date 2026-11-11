<script setup>
import { infoTipo } from '../calendario/tipos';
import { chaveDia, diaCurto, hora } from '../../utils/datas';

// Card de uma turma na home: progresso (aluno) ou total de alunos (professor) e os próximos eventos dela.
defineProps({
  turma: { type: Object, required: true },
  eventos: { type: Array, default: () => [] },
});
</script>

<template>
  <RouterLink
    :to="{ name: 'turma-inicio', params: { id: turma._id } }"
    class="flex h-full flex-col rounded-xl border bg-white p-5 shadow-sm transition-colors hover:border-primary-700 dark:bg-gray-900 dark:hover:border-primary-400"
  >
    <span class="text-base font-medium">{{ turma.disciplina.nome }}</span>
    <span class="mt-1 text-sm text-gray-600 dark:text-gray-400">
      Turma {{ turma.codigo }} · {{ turma.semestre }}
    </span>

    <div v-if="turma.progresso !== undefined" class="mt-4">
      <div class="flex justify-between text-sm">
        <span>Progresso</span>
        <span class="font-medium tabular-nums">
          {{ turma.concluidos }} de {{ turma.total }} · {{ turma.progresso }}%
        </span>
      </div>
      <div
        class="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
        role="progressbar"
        aria-label="Progresso na disciplina"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="turma.progresso"
      >
        <div
          class="h-full rounded-full bg-primary-700 dark:bg-primary-400"
          :style="{ width: `${turma.progresso}%` }"
        />
      </div>
    </div>
    <p v-else class="mt-4 text-sm text-gray-600 dark:text-gray-400">
      {{ turma.totalAlunos }} {{ turma.totalAlunos === 1 ? 'aluno' : 'alunos' }}
    </p>

    <ul v-if="eventos.length" class="mt-4 space-y-2 border-t pt-4">
      <li v-for="e in eventos" :key="e._id" class="flex items-start gap-2 text-sm">
        <span :class="['mt-1.5 h-2 w-2 shrink-0 rounded-full', infoTipo(e.tipo).ponto]" />
        <span class="min-w-0">
          <span class="block truncate">{{ e.titulo }}</span>
          <span class="text-xs tabular-nums text-gray-600 dark:text-gray-400">
            {{ diaCurto(chaveDia(e.inicio)) }} · {{ hora(e.inicio) }}
          </span>
        </span>
      </li>
    </ul>
  </RouterLink>
</template>

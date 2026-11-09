<script setup>
// Prévia decorativa da Home (dados genéricos); a barra fina de progresso é a assinatura do produto.
const disciplinas = [
  { nome: 'Algoritmos e Estruturas de Dados', turma: 'Turma A', progresso: 72 },
  { nome: 'Banco de Dados', turma: 'Turma B', progresso: 45 },
  { nome: 'Engenharia de Software', turma: 'Turma A', progresso: 18 },
];
</script>

<template>
  <div class="w-full max-w-md">
    <h2 class="text-3xl font-medium leading-tight">Disciplinas, materiais e notas em um só lugar</h2>

    <div class="mt-8 rounded-xl border bg-white p-6 dark:bg-gray-950">
      <div class="flex items-baseline justify-between text-sm">
        <span class="font-medium">Minhas disciplinas</span>
        <span class="tabular-nums text-gray-500 dark:text-gray-400">2/2026</span>
      </div>

      <ul class="mt-2 divide-y">
        <li v-for="d in disciplinas" :key="d.nome" class="py-4">
          <div class="flex items-baseline justify-between gap-4 text-sm">
            <span class="truncate">{{ d.nome }}</span>
            <span class="tabular-nums text-gray-500 dark:text-gray-400">{{ d.progresso }}%</span>
          </div>
          <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ d.turma }}</div>
          <div class="mt-2 h-1 rounded-full bg-gray-200 dark:bg-gray-800">
            <div class="h-1 rounded-full bg-primary-700" :style="{ width: `${d.progresso}%` }" />
          </div>
        </li>
      </ul>

      <div class="flex items-baseline justify-between border-t pt-4 text-sm">
        <span class="text-gray-500 dark:text-gray-400">Próximo evento</span>
        <span class="tabular-nums">Prova 1 · 18/11</span>
      </div>
    </div>
  </div>
</template>

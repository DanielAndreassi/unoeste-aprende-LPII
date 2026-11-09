<script setup>
import Avatar from '../ui/Avatar.vue';
import Marca from '../ui/Marca.vue';

// Janela decorativa com a Home (dados genéricos); a barra fina de progresso é a assinatura do produto.
const disciplinas = [
  { curso: 'Sistemas de Informação', nome: 'Algoritmos e Estruturas de Dados', progresso: 72 },
  { curso: 'Sistemas de Informação', nome: 'Banco de Dados', progresso: 45 },
  { curso: 'Sistemas de Informação', nome: 'Engenharia de Software', progresso: 18 },
  { curso: 'Sistemas de Informação', nome: 'Redes de Computadores', progresso: 90 },
  { curso: 'Sistemas de Informação', nome: 'Cálculo Diferencial', progresso: 33 },
  { curso: 'Sistemas de Informação', nome: 'Programação para Web', progresso: 60 },
];
const eventos = [
  ['Seg 10/11', 'Aula · Banco de Dados'],
  ['Qua 12/11', 'Prova 1 · Algoritmos'],
  ['Sex 14/11', 'Aula · Engenharia de Software'],
];
</script>

<template>
  <div
    class="animar-entrada w-[800px] shrink-0 rounded-t-xl border border-b-0 bg-gray-100 shadow-[0_24px_64px_rgba(0,0,0,0.4)] dark:bg-gray-950"
  >
    <div class="flex h-12 items-center border-b bg-white px-4 dark:bg-gray-900 rounded-t-xl">
      <Marca pequena />
      <div class="ml-auto flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Avatar :usuario="{ nome: 'Ana Souza' }" tamanho="h-6 w-6 text-xs" />
        Ana Souza
      </div>
    </div>

    <div class="p-6">
      <div class="flex items-baseline justify-between">
        <span class="text-lg font-medium">Minhas disciplinas</span>
        <span class="text-sm tabular-nums text-gray-500 dark:text-gray-400">2/2026</span>
      </div>

      <div class="mt-4 grid grid-cols-3 gap-4">
        <div v-for="d in disciplinas" :key="d.nome" class="rounded-xl border bg-white p-4 dark:bg-gray-900">
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ d.curso }}</p>
          <p class="mt-1 h-10 text-sm font-medium leading-5">{{ d.nome }}</p>
          <div class="mt-4 flex items-center gap-3">
            <div class="h-1 flex-1 rounded-full bg-gray-200 dark:bg-gray-800">
              <div class="h-1 rounded-full bg-primary-700" :style="{ width: `${d.progresso}%` }" />
            </div>
            <span class="text-xs tabular-nums text-gray-500 dark:text-gray-400">{{ d.progresso }}%</span>
          </div>
        </div>
      </div>

      <div class="mt-6 rounded-xl border bg-white p-4 dark:bg-gray-900">
        <p class="text-sm font-medium">Esta semana</p>
        <ul class="mt-2 divide-y text-sm">
          <li v-for="[dia, titulo] in eventos" :key="dia" class="flex justify-between py-2">
            <span>{{ titulo }}</span>
            <span class="tabular-nums text-gray-500 dark:text-gray-400">{{ dia }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

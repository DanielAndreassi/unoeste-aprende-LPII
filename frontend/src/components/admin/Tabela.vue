<script setup>
// Tabela das listas de admin: esqueleto enquanto carrega, aviso quando vazia.
// As células vêm do slot (uma <td> por coluna); a última coluna é a de ações.
defineProps({ colunas: Array, itens: Array, carregando: Boolean, vazio: String });
</script>

<template>
  <div
    v-if="carregando"
    class="space-y-3 rounded-xl border bg-white p-4 dark:bg-gray-900"
    aria-busy="true"
  >
    <div
      v-for="n in 4"
      :key="n"
      class="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
    />
  </div>
  <p
    v-else-if="!itens.length"
    class="rounded-xl border bg-white p-6 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-400"
  >
    {{ vazio }}
  </p>
  <div v-else class="overflow-x-auto rounded-xl border bg-white dark:bg-gray-900">
    <table class="w-full min-w-max text-left text-sm">
      <thead class="border-b text-gray-600 dark:text-gray-400">
        <tr>
          <th
            v-for="(c, i) in colunas"
            :key="c"
            scope="col"
            :class="['px-4 py-3 font-medium', i === colunas.length - 1 && 'text-right']"
          >
            {{ c }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y">
        <tr v-for="item in itens" :key="item._id">
          <slot :item="item" />
        </tr>
      </tbody>
    </table>
  </div>
</template>

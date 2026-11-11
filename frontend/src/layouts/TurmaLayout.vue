<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const menuAberto = ref(false);

// Fecha o drawer ao navegar (mobile)
watch(
  () => route.fullPath,
  () => (menuAberto.value = false),
);

// Cada módulo cria sua rota filha em router/index.js com estes caminhos (escopo.md › Disciplina).
// Os tópicos do Conteúdo também entram neste menu (ADR-0010).
const itens = [
  ['Início', ''],
  ['Conteúdo', 'conteudo'],
  ['Professores', 'professores'],
  ['Participantes', 'participantes'],
  ['Calendário', 'calendario'],
  ['Plano de Ensino', 'plano'],
  ['Notas', 'notas'],
  ['Assistente IA', 'assistente'],
];
</script>

<template>
  <div class="mx-auto flex max-w-7xl gap-6 px-4 py-6">
    <button
      type="button"
      class="fixed bottom-4 left-4 z-40 rounded-full bg-primary-800 px-4 py-3 text-white shadow-lg lg:hidden"
      :aria-expanded="menuAberto"
      aria-controls="menu-turma"
      @click="menuAberto = !menuAberto"
    >
      {{ menuAberto ? 'Fechar' : 'Menu' }}
    </button>
    <div
      v-if="menuAberto"
      class="fixed inset-0 z-30 bg-black/40 lg:hidden"
      @click="menuAberto = false"
    />

    <aside
      id="menu-turma"
      :class="[
        'fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto bg-white p-4 shadow-xl transition-transform dark:bg-gray-900',
        'lg:static lg:z-auto lg:translate-x-0 lg:rounded-xl lg:border lg:shadow-sm',
        menuAberto ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <nav aria-label="Menu da disciplina">
        <ul class="space-y-1">
          <li v-for="[rotulo, caminho] in itens" :key="caminho">
            <RouterLink
              :to="`/turmas/${route.params.id}/${caminho}`"
              class="block rounded-lg px-3 py-2 text-sm hover:bg-primary-50 dark:hover:bg-gray-800"
              exact-active-class="bg-primary-100 font-semibold text-primary-900 dark:bg-gray-800 dark:text-primary-300"
            >
              {{ rotulo }}
            </RouterLink>
          </li>
        </ul>
      </nav>
    </aside>

    <main class="min-w-0 flex-1">
      <RouterView />
    </main>
  </div>
</template>

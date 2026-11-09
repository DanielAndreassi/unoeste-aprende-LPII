<script setup>
import { useRoute } from 'vue-router';
import PreviewDisciplinas from '../components/auth/PreviewDisciplinas.vue';
import Marca from '../components/ui/Marca.vue';

// Título e subtítulo vêm de meta.titulo / meta.subtitulo da rota; o painel só aparece em telas largas.
const route = useRoute();
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-[5fr_6fr]">
    <main class="flex flex-col bg-white px-6 py-8 sm:px-12 lg:px-16 dark:bg-gray-950">
      <Marca />
      <div class="animar-entrada m-auto w-full max-w-sm py-12">
        <h1 class="font-serif text-4xl">{{ route.meta.titulo }}</h1>
        <p v-if="route.meta.subtitulo" class="mt-2 text-gray-600 dark:text-gray-400">
          {{ route.meta.subtitulo }}
        </p>
        <div class="mt-8">
          <RouterView />
        </div>
      </div>
    </main>

    <aside
      class="hidden flex-col overflow-hidden bg-primary-950 pl-16 pt-24 lg:sticky lg:top-0 lg:flex lg:h-screen"
      aria-hidden="true"
    >
      <h2 class="max-w-lg pr-12 font-serif text-5xl leading-[1.08] text-white">
        Disciplinas, materiais e notas em um só lugar
      </h2>
      <p class="mt-4 max-w-md pr-12 text-lg text-primary-200">
        Acompanhe o conteúdo de cada turma e o seu progresso no semestre
      </p>
      <PreviewDisciplinas class="mt-12" />
    </aside>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import PreviewDisciplinas from '../components/auth/PreviewDisciplinas.vue';

// O título vem de meta.titulo da rota; a prévia só aparece em telas largas.
const route = useRoute();
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-[5fr_6fr]">
    <main class="flex flex-col px-6 py-8 sm:px-12">
      <p class="text-lg font-medium text-primary-800 dark:text-primary-300">Aprender Unoeste</p>
      <div class="m-auto w-full max-w-sm py-12">
        <h1 class="mb-6 text-2xl font-medium">{{ route.meta.titulo }}</h1>
        <RouterView />
      </div>
    </main>
    <aside
      class="hidden items-center justify-center bg-gray-100 p-12 lg:flex dark:bg-gray-900"
      aria-hidden="true"
    >
      <PreviewDisciplinas />
    </aside>
  </div>
</template>

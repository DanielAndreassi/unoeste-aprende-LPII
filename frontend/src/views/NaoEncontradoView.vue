<template>
  <main class="mx-auto max-w-7xl px-4 py-16 text-center">
    <h1 class="text-3xl font-bold">Página não encontrada</h1>
    <RouterLink
      :to="{ name: 'home' }"
      class="mt-4 inline-block text-primary-700 underline dark:text-primary-300"
    >
      Voltar ao início
    </RouterLink>
  </main>
</template>

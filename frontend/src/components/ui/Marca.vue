<script setup>
// Marca: tile verde chapado com a inicial + nome do produto (sem gradiente).
// compacta: no celular mostra só o tile (o nome volta a partir de sm).
defineProps({ pequena: Boolean, compacta: Boolean });
</script>

<template>
  <span class="inline-flex items-center gap-3">
    <span
      aria-hidden="true"
      :class="[
        pequena ? 'h-6 w-6 rounded-md text-base' : 'h-8 w-8 rounded-lg text-xl',
        'inline-flex items-center justify-center bg-primary-800 font-serif leading-none text-white',
      ]"
    >
      A
    </span>
    <span
      :class="[
        pequena ? 'text-sm' : 'text-lg',
        compacta && 'hidden sm:inline',
        'font-medium text-gray-900 dark:text-gray-100',
      ]"
    >
      Aprender Unoeste
    </span>
  </span>
</template>

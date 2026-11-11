<script setup>
// Marca: ícone da Unoeste (public/titulo.png, o mesmo do favicon) + nome do produto.
// compacta: no celular mostra só o tile (o nome volta a partir de sm).
defineProps({ pequena: Boolean, compacta: Boolean });
</script>

<template>
  <span class="inline-flex items-center gap-3">
    <img src="/titulo.png" alt="" :class="pequena ? 'h-6 w-6 rounded-md' : 'h-8 w-8 rounded-lg'" />
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

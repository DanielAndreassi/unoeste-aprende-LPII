<script setup>
// Botão discreto, no mesmo estilo do "Sair" do header. `perigo` = ação destrutiva.
defineProps({ perigo: Boolean });
</script>

<template>
  <button
    type="button"
    :class="[
      'h-11 rounded-lg sm:h-10 px-3 text-sm transition-colors hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800',
      perigo && 'text-red-700 dark:text-red-400',
    ]"
  >
    <slot />
  </button>
</template>

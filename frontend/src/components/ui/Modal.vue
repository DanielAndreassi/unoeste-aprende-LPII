<script setup>
import { ref, watch } from 'vue';

// Janela modal sobre <dialog> nativo: foco preso, Esc e clique fora fecham. O conteúdo só é montado quando aberta.
const aberto = defineModel({ default: false });
defineProps({ titulo: String });
const el = ref(null);

watch(
  aberto,
  (v) => {
    if (v && !el.value.open) el.value.showModal();
    else if (!v && el.value.open) el.value.close();
  },
  { flush: 'post' },
);
</script>

<template>
  <dialog
    ref="el"
    class="m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl border bg-white p-0 text-gray-900 shadow-lg backdrop:bg-black/40 dark:bg-gray-900 dark:text-gray-100"
    @close="aberto = false"
    @click.self="aberto = false"
  >
    <div v-if="aberto" class="p-6">
      <h2 class="text-lg font-medium">{{ titulo }}</h2>
      <div class="mt-4">
        <slot />
      </div>
    </div>
  </dialog>
</template>

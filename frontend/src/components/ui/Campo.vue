<script setup>
import { useId } from 'vue';

// Campo de formulário com rótulo e erro ligados por aria; demais atributos (type, autocomplete…) vão ao <input>.
defineOptions({ inheritAttrs: false });
defineProps({ label: String, erro: String });
const modelo = defineModel({ default: '' });
const id = `campo-${useId()}`;
</script>

<template>
  <div>
    <label :for="id" class="mb-1 block text-sm font-medium">{{ label }}</label>
    <input
      :id="id"
      v-model="modelo"
      v-bind="$attrs"
      :aria-invalid="!!erro"
      :aria-describedby="erro ? `${id}-erro` : undefined"
      class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm transition-colors hover:border-gray-400 focus-visible:border-primary-700 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600 dark:focus-visible:border-primary-400 aria-invalid:border-red-600"
    />
    <p v-if="erro" :id="`${id}-erro`" class="mt-1 text-sm text-red-700 dark:text-red-400">
      {{ erro }}
    </p>
  </div>
</template>

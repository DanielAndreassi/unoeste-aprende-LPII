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
      class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 aria-invalid:border-red-600"
    />
    <p v-if="erro" :id="`${id}-erro`" class="mt-1 text-sm text-red-700 dark:text-red-400">
      {{ erro }}
    </p>
  </div>
</template>

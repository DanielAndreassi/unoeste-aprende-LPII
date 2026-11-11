<script setup>
import { useId } from 'vue';

// Select com rótulo e erro ligados por aria, no mesmo visual do Campo.
defineOptions({ inheritAttrs: false });
defineProps({ label: String, erro: String, opcoes: Array });
const modelo = defineModel({ default: '' });
const id = `select-${useId()}`;
</script>

<template>
  <div>
    <label :for="id" class="mb-1 block text-sm font-medium">{{ label }}</label>
    <select
      :id="id"
      v-model="modelo"
      v-bind="$attrs"
      :aria-invalid="!!erro"
      :aria-describedby="erro ? `${id}-erro` : undefined"
      class="h-11 w-full sm:h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm transition-colors hover:border-gray-400 focus-visible:border-primary-700 aria-invalid:border-red-600 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600 dark:focus-visible:border-primary-400"
    >
      <option v-for="o in opcoes" :key="o.valor" :value="o.valor">{{ o.rotulo }}</option>
    </select>
    <p v-if="erro" :id="`${id}-erro`" class="mt-1 text-sm text-red-700 dark:text-red-400">
      {{ erro }}
    </p>
  </div>
</template>

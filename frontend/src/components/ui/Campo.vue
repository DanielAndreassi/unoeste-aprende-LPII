<script setup>
import { computed, ref, useAttrs, useId } from 'vue';

// Campo de formulário com rótulo e erro ligados por aria; demais atributos (type, autocomplete…) vão ao <input>.
// Campos de senha ganham botão de mostrar/ocultar.
defineOptions({ inheritAttrs: false });
defineProps({ label: String, erro: String });
const modelo = defineModel({ default: '' });
const id = `campo-${useId()}`;
const attrs = useAttrs();

const senha = computed(() => attrs.type === 'password');
const visivel = ref(false);
</script>

<template>
  <div>
    <label :for="id" class="mb-1 block text-sm font-medium">{{ label }}</label>
    <div class="relative">
      <input
        :id="id"
        v-model="modelo"
        v-bind="$attrs"
        :type="senha && visivel ? 'text' : attrs.type"
        :aria-invalid="!!erro"
        :aria-describedby="erro ? `${id}-erro` : undefined"
        :class="[
          'h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm transition-colors hover:border-gray-400 focus-visible:border-primary-700 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600 dark:focus-visible:border-primary-400 aria-invalid:border-red-600',
          senha && 'pr-11',
        ]"
      />
      <button
        v-if="senha"
        type="button"
        class="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        :aria-label="visivel ? 'Ocultar senha' : 'Mostrar senha'"
        :aria-pressed="visivel"
        @click="visivel = !visivel"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <template v-if="visivel">
            <path d="M3 3l18 18" />
            <path d="M10.6 6.1A9.6 9.6 0 0 1 12 6c5 0 8.5 4.2 9.6 6a15 15 0 0 1-2.5 3" />
            <path d="M6.6 7.6A15 15 0 0 0 2.4 12c1.1 1.8 4.6 6 9.6 6a9.4 9.4 0 0 0 4-.9" />
            <path d="M9.9 10a3 3 0 0 0 4.1 4.1" />
          </template>
          <template v-else>
            <path
              d="M2.4 12C3.5 10.2 7 6 12 6s8.5 4.2 9.6 6c-1.1 1.8-4.6 6-9.6 6S3.5 13.8 2.4 12z"
            />
            <circle cx="12" cy="12" r="3" />
          </template>
        </svg>
      </button>
    </div>
    <p v-if="erro" :id="`${id}-erro`" class="mt-1 text-sm text-red-700 dark:text-red-400">
      {{ erro }}
    </p>
  </div>
</template>

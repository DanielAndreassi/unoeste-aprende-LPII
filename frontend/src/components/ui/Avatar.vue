<script setup>
import { computed } from 'vue';
import http from '../../api/http';

// Foto do usuário (pasta pública /uploads/avatars) ou, sem foto, as iniciais.
const props = defineProps({ usuario: Object, tamanho: { type: String, default: 'h-8 w-8' } });

const iniciais = computed(() =>
  (props.usuario?.nome ?? '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join(''),
);
const foto = computed(
  () =>
    props.usuario?.avatar &&
    new URL(`/uploads/avatars/${props.usuario.avatar}`, http.defaults.baseURL).href,
);
</script>

<template>
  <img
    v-if="foto"
    :src="foto"
    :alt="`Foto de ${usuario.nome}`"
    :class="[tamanho, 'shrink-0 rounded-full object-cover']"
  />
  <span
    v-else
    aria-hidden="true"
    :class="[
      tamanho,
      'inline-flex shrink-0 items-center justify-center rounded-full bg-primary-100 font-medium text-primary-900 dark:bg-primary-900 dark:text-primary-100',
    ]"
  >
    {{ iniciais }}
  </span>
</template>

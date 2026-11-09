<script setup>
import { computed } from 'vue';
import http from '../../api/http';

// Foto do usuário (pasta pública /uploads/avatars) ou, sem foto, as iniciais.
const props = defineProps({ usuario: Object, tamanho: { type: String, default: 'h-9 w-9' } });

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
  <img v-if="foto" :src="foto" :alt="`Foto de ${usuario.nome}`" :class="[tamanho, 'rounded-full object-cover']" />
  <span
    v-else
    aria-hidden="true"
    :class="[tamanho, 'inline-flex items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-900']"
  >
    {{ iniciais }}
  </span>
</template>

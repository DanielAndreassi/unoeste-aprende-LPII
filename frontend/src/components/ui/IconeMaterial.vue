<script setup>
import { computed } from 'vue';

// Ícone por tipo (link/texto) ou, para arquivo, pela extensão (design.md).
const props = defineProps({ material: { type: Object, required: true } });

const DOC = 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5';
const FORMAS = {
  documento: `${DOC}M9 13h6M9 17h6`,
  zip: `${DOC}M11 11h2M11 14h2M11 17h2`,
  planilha: `${DOC}M8 12h8M8 16h8M12 12v6`,
  apresentacao: 'M3 4h18v12H3zM12 16v4M8 20h8',
  imagem: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 9.5h.01',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  texto: 'M5 6h14M5 10h14M5 14h9M5 18h12',
};
const POR_EXTENSAO = {
  zip: 'zip',
  xls: 'planilha',
  xlsx: 'planilha',
  ppt: 'apresentacao',
  pptx: 'apresentacao',
  png: 'imagem',
  jpg: 'imagem',
};

const forma = computed(() => {
  const { tipo, arquivo } = props.material;
  if (tipo !== 'arquivo') return tipo;
  return POR_EXTENSAO[arquivo?.nome?.split('.').pop().toLowerCase()] ?? 'documento';
});
</script>

<template>
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="shrink-0 text-primary-800 dark:text-primary-300"
    aria-hidden="true"
  >
    <path :d="FORMAS[forma]" />
  </svg>
</template>

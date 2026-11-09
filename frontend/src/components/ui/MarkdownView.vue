<script setup>
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';

// ÚNICO lugar com v-html de conteúdo de usuário (ADR-0013): html:false ignora HTML cru.
const md = new MarkdownIt({ html: false, linkify: true, breaks: true });

const props = defineProps({ conteudo: { type: String, default: '' } });
const html = computed(() => md.render(props.conteudo));
</script>

<template>
  <div class="markdown" v-html="html" />
</template>

<script setup>
import BotaoSecundario from '../ui/BotaoSecundario.vue';
import Modal from '../ui/Modal.vue';

// Confirmação antes de toda exclusão (ADR-0006). Erro da API (ex.: 409 "tem turmas") aparece aqui e a janela segue aberta.
const aberto = defineModel({ default: false });
defineProps({ texto: { type: Object, default: () => ({}) }, erro: String, enviando: Boolean });
defineEmits(['confirmar']);
</script>

<template>
  <Modal v-model="aberto" :titulo="texto.titulo ?? 'Confirmar exclusão'">
    <p class="text-sm">{{ texto.mensagem }}</p>
    <p v-if="erro" role="alert" class="mt-3 text-sm text-red-700 dark:text-red-400">{{ erro }}</p>
    <div class="mt-4 flex justify-end gap-2">
      <BotaoSecundario @click="aberto = false">Cancelar</BotaoSecundario>
      <button
        type="button"
        class="btn-primario bg-red-700 hover:bg-red-800"
        :disabled="enviando"
        @click="$emit('confirmar')"
      >
        {{ enviando ? 'Aguarde…' : (texto.rotulo ?? 'Excluir') }}
      </button>
    </div>
  </Modal>
</template>

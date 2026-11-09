import { defineStore } from 'pinia';
import { ref, watchEffect } from 'vue';

// 1ª visita segue o sistema operacional; depois vale a escolha salva (design.md).
export const useTemaStore = defineStore('tema', () => {
  const salvo = localStorage.getItem('tema');
  const escuro = ref(
    salvo ? salvo === 'escuro' : window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  watchEffect(() => document.documentElement.classList.toggle('dark', escuro.value));

  function alternar() {
    escuro.value = !escuro.value;
    localStorage.setItem('tema', escuro.value ? 'escuro' : 'claro');
  }

  return { escuro, alternar };
});

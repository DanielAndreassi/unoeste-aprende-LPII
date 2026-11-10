import { defineStore } from 'pinia';
import * as api from '../api/notificacoes';

const INTERVALO = 60_000; // regras-negocio.md: o front consulta o servidor a cada 60 s
let timer;

export const useNotificacoesStore = defineStore('notificacoes', {
  state: () => ({ itens: [], naoLidas: 0 }),
  actions: {
    async carregar() {
      try {
        Object.assign(this, await api.listarNotificacoes());
      } catch {
        // falha de rede não deve incomodar: tenta de novo no próximo ciclo
      }
    },
    iniciar() {
      this.parar();
      this.carregar();
      timer = setInterval(() => !document.hidden && this.carregar(), INTERVALO);
    },
    parar() {
      clearInterval(timer);
      this.itens = [];
      this.naoLidas = 0;
    },
    async ler(n) {
      if (n.lida) return;
      await api.marcarLida(n._id);
      n.lida = true;
      this.naoLidas = Math.max(0, this.naoLidas - 1);
    },
    async lerTodas() {
      await api.marcarTodasLidas();
      this.itens.forEach((n) => (n.lida = true));
      this.naoLidas = 0;
    },
    async excluir(n) {
      await api.excluirNotificacao(n._id);
      this.itens = this.itens.filter((i) => i._id !== n._id);
      if (!n.lida) this.naoLidas = Math.max(0, this.naoLidas - 1);
    },
  },
});

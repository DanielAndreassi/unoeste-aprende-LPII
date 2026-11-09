import { defineStore } from 'pinia';

const CHAVE = 'auth';

function carregar() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) ?? {};
  } catch {
    return {};
  }
}

// Sessão do usuário (ADR-0006): token JWT + usuário, persistidos no localStorage.
export const useAuthStore = defineStore('auth', {
  state: () => ({ token: null, usuario: null, ...carregar() }),
  getters: {
    logado: (s) => !!s.token,
    role: (s) => s.usuario?.role ?? null,
  },
  actions: {
    definirSessao(token, usuario) {
      this.token = token;
      this.usuario = usuario;
      localStorage.setItem(CHAVE, JSON.stringify({ token, usuario }));
    },
    atualizarUsuario(usuario) {
      this.usuario = usuario;
      localStorage.setItem(CHAVE, JSON.stringify({ token: this.token, usuario }));
    },
    sair() {
      this.token = null;
      this.usuario = null;
      localStorage.removeItem(CHAVE);
    },
  },
});

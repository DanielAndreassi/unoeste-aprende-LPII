import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import router from '../router';

// Instância única (ADR-0006). Cada recurso tem seu arquivo em api/ usando esta instância.
const http = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api' });

http.interceptors.request.use((config) => {
  const { token } = useAuthStore();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const auth = useAuthStore();
    // 401 com sessão ativa = token expirado/usuário desativado; no login é só senha errada
    if (err.response?.status === 401 && auth.logado) {
      auth.sair();
      router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } });
    }
    return Promise.reject(err);
  },
);

// Mensagem pronta para o toast: lê o { erro } da API (ADR-0014).
export function mensagemErro(err) {
  return err.response?.data?.erro ?? 'Não foi possível conectar ao servidor';
}

export default http;

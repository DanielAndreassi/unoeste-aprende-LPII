import http from './http';

// Assistente IA (api.md, seção Assistente IA). Só as conversas do próprio usuário.
const dados = (r) => r.data;

export const listarConversas = (turmaId) => http.get(`/turmas/${turmaId}/conversas`).then(dados);
export const criarConversa = (turmaId) => http.post(`/turmas/${turmaId}/conversas`).then(dados);
export const obterConversa = (id) => http.get(`/conversas/${id}`).then(dados);
export const excluirConversa = (id) => http.delete(`/conversas/${id}`);
// devolve a conversa inteira já com a pergunta e a resposta
export const enviarMensagem = (id, texto) =>
  http.post(`/conversas/${id}/mensagens`, { texto }).then(dados);

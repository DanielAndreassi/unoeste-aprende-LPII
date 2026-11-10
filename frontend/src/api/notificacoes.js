import http from './http';

// Notificações do aluno (api.md, seção Notificações): { itens, naoLidas }
const dados = (r) => r.data;

export const listarNotificacoes = () => http.get('/notificacoes').then(dados);
export const marcarLida = (id) => http.patch(`/notificacoes/${id}/lida`).then(dados);
export const marcarTodasLidas = () => http.patch('/notificacoes/lidas');
export const excluirNotificacao = (id) => http.delete(`/notificacoes/${id}`);

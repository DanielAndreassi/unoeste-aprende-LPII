import http from './http';

// Calendário (api.md, seção Calendário). de/ate em ISO; o backend devolve os eventos que tocam o intervalo.
const dados = (r) => r.data;

// Eventos de uma disciplina (membro)
export const listarEventosTurma = (turmaId, { de, ate }) =>
  http.get(`/turmas/${turmaId}/eventos`, { params: { de, ate } }).then(dados);

// Eventos de todas as turmas do usuário + institucionais; `turma` filtra por turma
export const listarEventos = (params) => http.get('/eventos', { params }).then(dados);

// Professor
export const criarEventoTurma = (turmaId, corpo) =>
  http.post(`/turmas/${turmaId}/eventos`, corpo).then(dados);
export const atualizarEvento = (id, corpo) => http.put(`/eventos/${id}`, corpo).then(dados);
export const excluirEvento = (id) => http.delete(`/eventos/${id}`);

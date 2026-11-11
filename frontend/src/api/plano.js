import http from './http';

// Plano de ensino (api.md, seção Plano de Ensino): membro lê, professor salva
export const obterPlano = (turmaId) => http.get(`/turmas/${turmaId}/plano`).then((r) => r.data);
export const salvarPlano = (turmaId, corpo) =>
  http.put(`/turmas/${turmaId}/plano`, corpo).then((r) => r.data);

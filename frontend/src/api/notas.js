import http from './http';

// Avaliações e notas (api.md, seção Notas)
const dados = (r) => r.data;

// Professor: tabela da turma · aluno: só a própria linha
export const tabelaNotas = (turmaId) => http.get(`/turmas/${turmaId}/notas`).then(dados);

// Professor
export const criarAvaliacao = (turmaId, corpo) =>
  http.post(`/turmas/${turmaId}/avaliacoes`, corpo).then(dados);
export const atualizarAvaliacao = (id, corpo) => http.put(`/avaliacoes/${id}`, corpo).then(dados);
export const excluirAvaliacao = (id) => http.delete(`/avaliacoes/${id}`);
// lote [{ aluno, valor }]; valor null apaga a nota
export const lancarNotas = (avaliacaoId, lote) =>
  http.put(`/avaliacoes/${avaliacaoId}/notas`, lote);

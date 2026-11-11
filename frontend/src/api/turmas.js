import http from './http';

// Turmas do usuário, agrupadas por curso (api.md, seção Turma do usuário)
export const minhasTurmas = (params) => http.get('/minhas-turmas', { params }).then((r) => r.data);

// Turma (com disciplina e professores) e participantes; o professor recebe também o % de cada aluno
export const obterTurma = (id) => http.get(`/turmas/${id}`).then((r) => r.data);
export const participantes = (id) => http.get(`/turmas/${id}/participantes`).then((r) => r.data);

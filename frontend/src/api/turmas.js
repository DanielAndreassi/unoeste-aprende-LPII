import http from './http';

// Turmas do usuário, agrupadas por curso (api.md, seção Turma do usuário)
export const minhasTurmas = (params) => http.get('/minhas-turmas', { params }).then((r) => r.data);

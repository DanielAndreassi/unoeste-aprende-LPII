import http from './http';

// Telas de admin (api.md, seção Admin). Usuários: lista paginada { itens, total, page, paginas }; o resto: arrays.
const dados = (r) => r.data;

export const usuarios = {
  listar: (params) => http.get('/usuarios', { params }).then(dados),
  criar: (corpo) => http.post('/usuarios', corpo).then(dados),
  atualizar: (id, corpo) => http.put(`/usuarios/${id}`, corpo).then(dados),
  desativar: (id) => http.delete(`/usuarios/${id}`),
};

export const cursos = {
  listar: () => http.get('/cursos').then(dados),
  criar: (corpo) => http.post('/cursos', corpo).then(dados),
  atualizar: (id, corpo) => http.put(`/cursos/${id}`, corpo).then(dados),
  excluir: (id) => http.delete(`/cursos/${id}`),
};

export const disciplinas = {
  listar: () => http.get('/disciplinas').then(dados),
  criar: (corpo) => http.post('/disciplinas', corpo).then(dados),
  atualizar: (id, corpo) => http.put(`/disciplinas/${id}`, corpo).then(dados),
  excluir: (id) => http.delete(`/disciplinas/${id}`),
};

export const turmas = {
  listar: () => http.get('/turmas').then(dados),
  criar: (corpo) => http.post('/turmas', corpo).then(dados),
  atualizar: (id, corpo) => http.put(`/turmas/${id}`, corpo).then(dados),
  excluir: (id) => http.delete(`/turmas/${id}`),
};

export const matriculas = {
  listar: (turmaId) => http.get(`/turmas/${turmaId}/matriculas`).then(dados),
  matricular: (turmaId, alunos) =>
    http.post(`/turmas/${turmaId}/matriculas`, { alunos }).then(dados),
  remover: (id) => http.delete(`/matriculas/${id}`),
};

export const eventosInstitucionais = {
  listar: () => http.get('/eventos-institucionais').then(dados),
  criar: (corpo) => http.post('/eventos-institucionais', corpo).then(dados),
  atualizar: (id, corpo) => http.put(`/eventos-institucionais/${id}`, corpo).then(dados),
  excluir: (id) => http.delete(`/eventos-institucionais/${id}`),
};

import http from './http';

const dados = (r) => r.data;

export const arvore = (turmaId) => http.get(`/turmas/${turmaId}/conteudo`).then(dados);

export const criarTopico = (turmaId, titulo) =>
  http.post(`/turmas/${turmaId}/topicos`, { titulo }).then(dados);
export const atualizarTopico = (id, titulo) => http.put(`/topicos/${id}`, { titulo }).then(dados);
export const excluirTopico = (id) => http.delete(`/topicos/${id}`);

export const criarSecao = (topicoId, titulo) =>
  http.post(`/topicos/${topicoId}/secoes`, { titulo }).then(dados);
export const atualizarSecao = (id, titulo) => http.put(`/secoes/${id}`, { titulo }).then(dados);
export const excluirSecao = (id) => http.delete(`/secoes/${id}`);

// `corpo`: FormData (tipo arquivo) ou objeto (link/texto)
export const criarMaterial = (secaoId, corpo) =>
  http.post(`/secoes/${secaoId}/materiais`, corpo).then(dados);
export const atualizarMaterial = (id, corpo) => http.put(`/materiais/${id}`, corpo).then(dados);
export const excluirMaterial = (id) => http.delete(`/materiais/${id}`);

// ids = todos os irmãos na nova ordem; pai = id do tópico (seções) ou da seção (materiais)
export const reordenar = (turmaId, nivel, pai, ids) =>
  http.patch(`/turmas/${turmaId}/conteudo/ordem`, { nivel, pai, ids });

// Progresso (só aluno): marcar = PUT (200), desmarcar = DELETE (204)
export const marcarConcluido = (materialId) => http.put(`/materiais/${materialId}/progresso`);
export const desmarcarConcluido = (materialId) => http.delete(`/materiais/${materialId}/progresso`);

// O download exige o Bearer, então não dá para usar <a href>: baixa como blob e dispara o salvamento.
export async function baixarMaterial(material) {
  const { data } = await http.get(`/materiais/${material._id}/download`, { responseType: 'blob' });
  const url = URL.createObjectURL(data);
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: material.arquivo.nome,
  });
  a.click();
  URL.revokeObjectURL(url);
}

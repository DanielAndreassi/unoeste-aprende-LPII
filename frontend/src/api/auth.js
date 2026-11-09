import http from './http';

export const login = (email, senha) => http.post('/auth/login', { email, senha }).then((r) => r.data);
export const esqueciSenha = (email) => http.post('/auth/forgot-password', { email });
export const redefinirSenha = (token, senha) => http.post('/auth/reset-password', { token, senha });
export const me = () => http.get('/auth/me').then((r) => r.data);

// FormData: nome e/ou avatar (multipart)
export const atualizarPerfil = (dados) => http.put('/perfil', dados).then((r) => r.data);
export const trocarSenha = (senhaAtual, senhaNova) =>
  http.put('/perfil/senha', { senhaAtual, senhaNova });

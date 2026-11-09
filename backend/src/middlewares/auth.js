import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
import HttpError from '../utils/HttpError.js';

// Valida o Bearer e recarrega o usuário a cada requisição para recusar contas desativadas (ADR-0015).
export default async function auth(req, _res, next) {
  const [tipo, token] = req.headers.authorization?.split(' ') ?? [];
  if (tipo !== 'Bearer' || !token) throw new HttpError(401, 'Faça login para continuar');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, 'Sessão expirada, faça login novamente');
  }

  const usuario = await Usuario.findById(payload.id);
  if (!usuario?.ativo) throw new HttpError(401, 'Usuário inativo ou inexistente');
  req.usuario = usuario;
  next();
}

import { promisify } from 'node:util';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import Usuario from '../models/Usuario.js';

const verificarToken = promisify(jwt.verify);

// Valida o Bearer e recarrega o usuário a cada requisição para recusar contas desativadas (ADR-0015).
// Token inválido/expirado rejeita a promise e o errorHandler responde 401.
export default async function auth(req, _res, next) {
  const [esquema, token] = req.get('Authorization')?.split(' ') ?? [];
  if (esquema !== 'Bearer' || !token) throw createError(401, 'Faça login para continuar');

  const { id } = await verificarToken(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  const usuario = await Usuario.findById(id);
  if (!usuario?.ativo) throw createError(401, 'Usuário inativo ou inexistente');

  req.usuario = usuario;
  next();
}

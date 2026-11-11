import createError from 'http-errors';
import Notificacao from '../models/Notificacao.js';

const LIMITE = 50;

// Só as próprias: notificação de outro usuário é 404, como se não existisse.
export function doDono(req, _res, next) {
  if (!req.notificacao.usuario.equals(req.usuario._id))
    throw createError(404, 'Registro não encontrado');
  next();
}

export async function listar(req, res) {
  const filtro = { usuario: req.usuario._id };
  const [itens, naoLidas] = await Promise.all([
    Notificacao.find(filtro).sort('-createdAt').limit(LIMITE).lean(),
    Notificacao.countDocuments({ ...filtro, lida: false }),
  ]);
  res.json({ itens, naoLidas });
}

export async function marcarLida(req, res) {
  req.notificacao.lida = true;
  res.json(await req.notificacao.save());
}

export async function marcarTodasLidas(req, res) {
  await Notificacao.updateMany({ usuario: req.usuario._id, lida: false }, { lida: true });
  res.status(204).end();
}

export async function excluir(req, res) {
  await req.notificacao.deleteOne();
  res.status(204).end();
}

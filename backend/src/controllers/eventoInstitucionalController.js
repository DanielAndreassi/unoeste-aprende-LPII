import createError from 'http-errors';
import Evento from '../models/Evento.js';

const CAMPOS = ['titulo', 'tipo', 'link', 'inicio', 'fim'];

// Só estes campos vêm do cliente: turma fica null (institucional).
function camposDo(body = {}) {
  return Object.fromEntries(CAMPOS.filter((c) => body[c] !== undefined).map((c) => [c, body[c]]));
}

export async function listar(_req, res) {
  res.json(await Evento.find({ turma: null }).sort('inicio').lean());
}

export async function criar(req, res) {
  const evento = await Evento.create(camposDo(req.body));
  res.status(201).json(evento);
}

export async function atualizar(req, res) {
  const campos = camposDo(req.body);
  const inicio = campos.inicio ?? req.evento.inicio;
  const fim = campos.fim ?? req.evento.fim;
  if (new Date(fim) < new Date(inicio)) throw createError(400, 'O fim deve ser depois do início');
  res.json(await req.evento.set(campos).save());
}

export async function excluir(req, res) {
  await req.evento.deleteOne();
  res.status(204).end();
}

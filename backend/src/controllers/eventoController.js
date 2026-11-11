import createError from 'http-errors';
import Evento from '../models/Evento.js';
import Turma from '../models/Turma.js';
import Matricula from '../models/Matricula.js';
import Notificacao from '../models/Notificacao.js';
import '../models/Disciplina.js'; // registra o schema usado no populate

const CAMPOS = ['titulo', 'tipo', 'link', 'inicio', 'fim'];

// Só estes campos vêm do cliente: a turma vem de req.turma, nunca do body.
function camposDo(body = {}) {
  return Object.fromEntries(CAMPOS.filter((c) => body[c] !== undefined).map((c) => [c, body[c]]));
}

function data(texto) {
  const d = typeof texto === 'string' ? new Date(texto) : null;
  if (!d || Number.isNaN(d.getTime())) throw createError(400, 'Data inválida; use ISO 8601');
  return d;
}

// Sobreposição com [de, ate]: o evento termina depois de `de` e começa antes de `ate`.
function periodo({ de, ate }) {
  const filtro = {};
  if (de !== undefined) filtro.fim = { $gte: data(de) };
  if (ate !== undefined) filtro.inicio = { $lte: data(ate) };
  return filtro;
}

// Turmas em que o usuário tem vínculo; null = admin, vê todas.
async function turmasDo({ role, _id }) {
  if (role === 'admin') return null;
  if (role === 'professor') return Turma.distinct('_id', { professores: _id });
  return Matricula.distinct('turma', { aluno: _id });
}

const rotulo = (t) => `${t.disciplina.nome} - ${t.codigo} (${t.semestre})`;

function visao(e) {
  return {
    _id: e._id,
    titulo: e.titulo,
    tipo: e.tipo,
    link: e.link ?? null,
    inicio: e.inicio,
    fim: e.fim,
    turma: e.turma ? { _id: e.turma._id, rotulo: rotulo(e.turma) } : null,
  };
}

export async function listarDoUsuario(req, res) {
  const { turma } = req.query;
  const filtro = periodo(req.query);
  const minhas = await turmasDo(req.usuario);
  if (turma) {
    if (minhas && !minhas.some((id) => String(id) === turma))
      throw createError(403, 'Você não tem acesso a esta turma');
    filtro.$or = [{ turma: null }, { turma }];
  } else if (minhas) {
    filtro.$or = [{ turma: null }, { turma: { $in: minhas } }];
  }

  const eventos = await Evento.find(filtro)
    .sort('inicio')
    .populate({
      path: 'turma',
      select: 'codigo semestre disciplina',
      populate: { path: 'disciplina', select: 'nome' },
    })
    .lean();
  res.json(eventos.map(visao));
}

export async function listarDaTurma(req, res) {
  const eventos = await Evento.find({ ...periodo(req.query), turma: req.turma._id })
    .sort('inicio')
    .lean();
  res.json(eventos);
}

export async function criar(req, res) {
  const evento = await Evento.create({ ...camposDo(req.body), turma: req.turma._id });
  await Notificacao.notificarTurma(req.turma, {
    tipo: 'evento',
    mensagem: `Novo evento: ${evento.titulo}`,
    pagina: 'calendario',
  });
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

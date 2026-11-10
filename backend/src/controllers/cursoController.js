import createError from 'http-errors';
import Curso from '../models/Curso.js';
import Disciplina from '../models/Disciplina.js';

export const listar = async (_req, res) => res.json(await Curso.find().sort('nome'));

export async function criar(req, res) {
  const { nome, sigla } = req.body;
  res.status(201).json(await Curso.create({ nome, sigla }));
}

export const obter = (req, res) => res.json(req.curso);

export async function atualizar(req, res) {
  const { nome, sigla } = req.body;
  req.curso.set({ nome, sigla });
  res.json(await req.curso.save());
}

export async function excluir(req, res) {
  if (await Disciplina.exists({ curso: req.curso._id }))
    throw createError(409, 'Curso tem disciplinas e não pode ser excluído');
  await req.curso.deleteOne();
  res.status(204).end();
}

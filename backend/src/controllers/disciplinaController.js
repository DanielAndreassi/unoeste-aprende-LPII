import createError from 'http-errors';
import Disciplina from '../models/Disciplina.js';
import Turma from '../models/Turma.js';

export async function listar(_req, res) {
  res.json(await Disciplina.find().sort('nome').populate('curso', 'nome sigla'));
}

export async function criar(req, res) {
  const { nome, curso, cargaHoraria } = req.body;
  const disciplina = await Disciplina.create({ nome, curso, cargaHoraria });
  res.status(201).json(await disciplina.populate('curso', 'nome sigla'));
}

export async function obter(req, res) {
  res.json(await req.disciplina.populate('curso', 'nome sigla'));
}

export async function atualizar(req, res) {
  const { nome, curso, cargaHoraria } = req.body;
  req.disciplina.set({ nome, curso, cargaHoraria });
  await req.disciplina.save();
  res.json(await req.disciplina.populate('curso', 'nome sigla'));
}

export async function excluir(req, res) {
  if (await Turma.exists({ disciplina: req.disciplina._id }))
    throw createError(409, 'Disciplina tem turmas e não pode ser excluída');
  await req.disciplina.deleteOne();
  res.status(204).end();
}

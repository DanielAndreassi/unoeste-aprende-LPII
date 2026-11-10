import Avaliacao from '../models/Avaliacao.js';

// Só estes campos vêm do cliente: a turma vem de req.turma, nunca do body.
function camposDo({ nome, peso, data } = {}) {
  return Object.fromEntries(
    Object.entries({ nome, peso, data }).filter(([, v]) => v !== undefined),
  );
}

export async function listar(req, res) {
  res.json(await Avaliacao.find({ turma: req.turma._id }).sort('data _id'));
}

export async function criar(req, res) {
  res.status(201).json(await Avaliacao.create({ ...camposDo(req.body), turma: req.turma._id }));
}

export async function atualizar(req, res) {
  res.json(await req.avaliacao.set(camposDo(req.body)).save());
}

export async function excluir(req, res) {
  await req.avaliacao.deleteOne(); // apaga as notas (cascata no model)
  res.status(204).end();
}

import createError from 'http-errors';
import mongoose from 'mongoose';
import Avaliacao from '../models/Avaliacao.js';
import Matricula from '../models/Matricula.js';
import Nota from '../models/Nota.js';
import { calcularMedia, situacao } from '../utils/notas.js';

// Lote [{ aluno, valor }]: valor null apaga a nota. Tudo ou nada: valida antes de gravar.
export async function lancar(req, res) {
  const lote = req.body;
  if (!Array.isArray(lote) || lote.length === 0) throw createError(400, 'Informe a lista de notas');

  const ids = lote.map((n) => String(n?.aluno));
  if (!ids.every((id) => mongoose.isObjectIdOrHexString(id)))
    throw createError(400, 'Identificador de aluno inválido');
  if (new Set(ids).size !== ids.length) throw createError(400, 'Aluno repetido na lista');
  for (const { valor } of lote)
    if (valor !== null && (typeof valor !== 'number' || !(valor >= 0 && valor <= 10)))
      throw createError(400, 'A nota deve ser um número de 0 a 10');

  const matriculados = new Set(
    (await Matricula.distinct('aluno', { turma: req.turma._id })).map(String),
  );
  if (!ids.every((id) => matriculados.has(id)))
    throw createError(400, 'Há alunos que não estão matriculados nesta turma');

  const avaliacao = req.avaliacao._id;
  await Nota.bulkWrite(
    lote.map(({ aluno, valor }) =>
      valor === null
        ? { deleteOne: { filter: { avaliacao, aluno } } }
        : {
            updateOne: {
              filter: { avaliacao, aluno },
              update: { $set: { valor } },
              upsert: true,
            },
          },
    ),
  );
  // TODO(notificações — 13/11): avisar o aluno de nota lançada ou alterada.
  res.status(204).end();
}

// prof: todos os alunos; mat: só o próprio. Média e situação saem de utils/notas.js (ADR-0007).
export async function tabela(req, res) {
  const avaliacoes = await Avaliacao.find({ turma: req.turma._id }).sort('data _id').lean();

  let alunos;
  if (req.vinculo === 'prof') {
    const matriculas = await Matricula.find({ turma: req.turma._id })
      .populate('aluno', 'nome email avatar')
      .lean();
    alunos = matriculas.map((m) => m.aluno).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  } else {
    alunos = [req.usuario];
  }

  const notas = await Nota.find({
    avaliacao: { $in: avaliacoes.map((a) => a._id) },
    aluno: { $in: alunos.map((a) => a._id) },
  }).lean();
  const valorDe = new Map(notas.map((n) => [`${n.aluno}:${n.avaliacao}`, n.valor]));

  res.json({
    avaliacoes,
    alunos: alunos.map((aluno) => {
      const mapa = Object.fromEntries(
        avaliacoes.map((a) => [a._id, valorDe.get(`${aluno._id}:${a._id}`) ?? null]),
      );
      const itens = avaliacoes.map((a) => ({ peso: a.peso, valor: mapa[a._id] }));
      return {
        aluno: { _id: aluno._id, nome: aluno.nome, email: aluno.email, avatar: aluno.avatar },
        notas: mapa,
        media: calcularMedia(itens),
        situacao: situacao(itens),
      };
    }),
  });
}

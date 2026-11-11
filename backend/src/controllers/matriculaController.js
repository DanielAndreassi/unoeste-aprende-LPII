import createError from 'http-errors';
import mongoose from 'mongoose';
import Usuario from '../models/Usuario.js';
import Matricula from '../models/Matricula.js';
import Material from '../models/Material.js';
import Progresso from '../models/Progresso.js';
import { percentual } from '../utils/progresso.js';

const porNome = (a, b) => a.nome.localeCompare(b.nome, 'pt-BR');

// --- matrículas (adm) ---

export async function listar(req, res) {
  const matriculas = await Matricula.find({ turma: req.turma._id })
    .populate('aluno', 'nome email avatar')
    .lean();
  matriculas.sort((a, b) => porNome(a.aluno, b.aluno));
  res.json(matriculas);
}

// Em lote e idempotente: quem já está matriculado é ignorado; quem não é aluno ativo recusa o lote inteiro.
export async function criar(req, res) {
  const alunos = req.body?.alunos;
  if (!Array.isArray(alunos) || alunos.length === 0)
    throw createError(400, 'Informe a lista de alunos');
  if (!alunos.every((id) => mongoose.isObjectIdOrHexString(id)))
    throw createError(400, 'Identificador inválido na lista de alunos');

  const ids = [...new Set(alunos.map(String))];
  const validos = new Set(
    (await Usuario.distinct('_id', { _id: { $in: ids }, role: 'aluno', ativo: true })).map(String),
  );
  const invalidos = ids.filter((id) => !validos.has(id));
  if (invalidos.length) throw createError(400, `Não são alunos ativos: ${invalidos.join(', ')}`);

  const turma = req.turma._id;
  const jaMatriculados = new Set(
    (await Matricula.distinct('aluno', { turma, aluno: { $in: ids } })).map(String),
  );
  const novas = ids.filter((id) => !jaMatriculados.has(id));
  await Matricula.insertMany(novas.map((aluno) => ({ aluno, turma })));
  res.status(201).json({ criadas: novas.length, ignoradas: ids.length - novas.length });
}

export async function excluir(req, res) {
  await req.matricula.deleteOne();
  res.status(204).end();
}

// --- participantes (membro e adm) ---

export async function participantes(req, res) {
  const turma = await req.turma.populate('professores', 'nome email avatar');
  const matriculas = await Matricula.find({ turma: turma._id })
    .populate('aluno', 'nome email avatar')
    .lean();

  // % de progresso só para o professor, em duas agregações (não uma query por aluno)
  let progressoPorAluno = null;
  if (req.vinculo === 'prof') {
    const [total, concluidos] = await Promise.all([
      Material.countDocuments({ turma: turma._id }),
      Progresso.aggregate([
        { $match: { turma: turma._id } },
        { $group: { _id: '$aluno', n: { $sum: 1 } } },
      ]),
    ]);
    progressoPorAluno = new Map(concluidos.map((p) => [String(p._id), percentual(p.n, total)]));
  }

  const alunos = matriculas
    .map(({ aluno }) =>
      progressoPorAluno
        ? { ...aluno, progresso: progressoPorAluno.get(String(aluno._id)) ?? 0 }
        : aluno,
    )
    .sort(porNome);
  res.json({ professores: turma.professores, alunos });
}

import createError from 'http-errors';
import Turma from '../models/Turma.js';
import '../models/Disciplina.js'; // registra o schema usado no populate
import '../models/Curso.js';
import '../models/Usuario.js';
import Matricula from '../models/Matricula.js';
import Material from '../models/Material.js';
import Progresso from '../models/Progresso.js';
import { percentual } from '../utils/progresso.js';
import { semestreAtual } from '../utils/semestre.js';

const FORMATO_SEMESTRE = /^[12]\/\d{4}$/;

// "2/2026" não ordena como string (vira "2/2026" > "1/2027"): ano primeiro, depois semestre.
const chaveSemestre = (s) => {
  const [sem, ano] = s.split('/');
  return Number(ano) * 10 + Number(sem);
};

const rotulo = (t) => `${t.disciplina.nome} - ${t.codigo} (${t.semestre})`;

const populaDisciplina = {
  path: 'disciplina',
  select: 'nome curso',
  populate: { path: 'curso', select: 'nome sigla' },
};

// Turmas do usuário pelo perfil (ADR-0002): admin vê todas.
async function filtroDoUsuario(usuario) {
  if (usuario.role === 'admin') return {};
  if (usuario.role === 'professor') return { professores: usuario._id };
  return { _id: { $in: await Matricula.distinct('turma', { aluno: usuario._id }) } };
}

// Contagem por turma numa agregação só.
const contarPorTurma = (Model, turmas) =>
  Model.aggregate([
    { $match: { turma: { $in: turmas } } },
    { $group: { _id: '$turma', n: { $sum: 1 } } },
  ]).then((linhas) => new Map(linhas.map((l) => [String(l._id), l.n])));

export async function obterTurma(req, res) {
  const turma = await req.turma.populate([
    populaDisciplina,
    { path: 'professores', select: 'nome email avatar' },
  ]);
  res.json(turma);
}

export async function listar(req, res) {
  const semestre = req.query.semestre ?? semestreAtual();
  if (typeof semestre !== 'string' || !FORMATO_SEMESTRE.test(semestre))
    throw createError(400, 'Semestre deve ser no formato 1/2026 ou 2/2026');

  const { role, _id } = req.usuario;
  const todas = await Turma.find(await filtroDoUsuario(req.usuario))
    .populate(populaDisciplina)
    .lean();
  const semestres = [...new Set(todas.map((t) => t.semestre))].sort(
    (a, b) => chaveSemestre(b) - chaveSemestre(a),
  );
  const turmas = todas
    .filter((t) => t.semestre === semestre)
    .sort((a, b) => rotulo(a).localeCompare(rotulo(b), 'pt-BR'));

  // Só o aluno vê progresso; professor e admin veem o total de alunos.
  const ids = turmas.map((t) => t._id);
  let dadosPorTurma = new Map();
  if (turmas.length && role === 'aluno') {
    const [concluidos, totais] = await Promise.all([
      Progresso.aggregate([
        { $match: { aluno: _id, turma: { $in: ids } } },
        { $group: { _id: '$turma', n: { $sum: 1 } } },
      ]).then((linhas) => new Map(linhas.map((l) => [String(l._id), l.n]))),
      contarPorTurma(Material, ids),
    ]);
    dadosPorTurma = new Map(
      ids.map((id) => {
        const feitos = concluidos.get(String(id)) ?? 0;
        const total = totais.get(String(id)) ?? 0;
        return [String(id), { progresso: percentual(feitos, total), concluidos: feitos, total }];
      }),
    );
  } else if (turmas.length) {
    const totalAlunos = await contarPorTurma(Matricula, ids);
    dadosPorTurma = new Map(
      ids.map((id) => [String(id), { totalAlunos: totalAlunos.get(String(id)) ?? 0 }]),
    );
  }

  const cursos = new Map();
  for (const t of turmas) {
    const { curso } = t.disciplina;
    const chave = String(curso._id);
    if (!cursos.has(chave))
      cursos.set(chave, {
        curso: { _id: curso._id, nome: curso.nome, sigla: curso.sigla },
        turmas: [],
      });
    cursos.get(chave).turmas.push({
      _id: t._id,
      codigo: t.codigo,
      semestre: t.semestre,
      disciplina: { _id: t.disciplina._id, nome: t.disciplina.nome },
      rotulo: rotulo(t),
      ...dadosPorTurma.get(String(t._id)),
    });
  }

  res.json({
    semestre,
    semestres,
    cursos: [...cursos.values()].sort((a, b) => a.curso.nome.localeCompare(b.curso.nome, 'pt-BR')),
  });
}

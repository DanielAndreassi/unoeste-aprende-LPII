import createError from 'http-errors';
import Usuario from '../models/Usuario.js';
import Turma from '../models/Turma.js';
import Matricula from '../models/Matricula.js';
import Topico from '../models/Topico.js';
import Secao from '../models/Secao.js';
import Material from '../models/Material.js';
import Evento from '../models/Evento.js';
import Avaliacao from '../models/Avaliacao.js';
import Conversa from '../models/Conversa.js';

// Só professor ativo pode ser associado à turma; ids duplicados contam uma vez.
async function validarProfessores(ids) {
  const unicos = [...new Set(ids.map(String))];
  const validos = await Usuario.countDocuments({
    _id: { $in: unicos },
    role: 'professor',
    ativo: true,
  });
  if (validos !== unicos.length) throw createError(400, 'Professores inválidos ou inativos');
}

export async function listar(req, res) {
  const filtro = typeof req.query.semestre === 'string' ? { semestre: req.query.semestre } : {};
  res.json(
    await Turma.find(filtro)
      .sort('semestre codigo')
      .populate('disciplina', 'nome')
      .populate('professores', 'nome email'),
  );
}

export async function criar(req, res) {
  const { disciplina, codigo, semestre } = req.body;
  const professores = [req.body.professores ?? []].flat();
  await validarProfessores(professores);
  const turma = await Turma.create({ disciplina, codigo, semestre, professores });
  res.status(201).json(turma);
}

export async function atualizar(req, res) {
  const { disciplina, codigo, semestre } = req.body;
  const professores = [req.body.professores ?? []].flat();
  await validarProfessores(professores);
  req.turma.set({ disciplina, codigo, semestre, professores });
  res.json(await req.turma.save());
}

export async function excluir(req, res) {
  const dependentes = await Promise.all(
    [Matricula, Topico, Secao, Material, Evento, Avaliacao, Conversa].map((Model) =>
      Model.exists({ turma: req.turma._id }),
    ),
  );
  if (dependentes.some(Boolean))
    throw createError(409, 'Turma tem matrículas, conteúdo ou avaliações e não pode ser excluída');
  await req.turma.deleteOne();
  res.status(204).end();
}

import createError from 'http-errors';
import PlanoEnsino from '../models/PlanoEnsino.js';

const CAMPOS = ['ementa', 'objetivos', 'conteudoProgramatico', 'avaliacao', 'bibliografia'];

// Turma sem plano devolve os cinco campos vazios, em vez de 404.
export async function obter(req, res) {
  const plano = await PlanoEnsino.findOne({ turma: req.turma._id }).lean();
  res.json(plano ?? { turma: req.turma._id, ...Object.fromEntries(CAMPOS.map((c) => [c, ''])) });
}

// Upsert: só os cinco campos vêm do cliente; a turma vem de req.turma.
export async function salvar(req, res) {
  const campos = Object.fromEntries(
    CAMPOS.filter((c) => req.body?.[c] !== undefined).map((c) => [c, req.body[c]]),
  );
  if (Object.values(campos).some((v) => typeof v !== 'string'))
    throw createError(400, 'Os campos do plano devem ser texto');
  const plano = await PlanoEnsino.findOneAndUpdate(
    { turma: req.turma._id },
    { $set: campos },
    { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true },
  );
  res.json(plano);
}

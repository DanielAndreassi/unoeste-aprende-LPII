import Turma from '../models/Turma.js';
import Matricula from '../models/Matricula.js';
import HttpError from '../utils/HttpError.js';

/**
 * Confere o vínculo do usuário com a turma (ADR-0014) e preenche req.turma e req.vinculo ('prof' | 'mat' | 'adm').
 * Vem depois de `auth`.
 *
 * - vinculoTurma()                       → turma = req.params.id   (rotas /turmas/:id/...)
 * - vinculoTurma({ model: Material })    → carrega Material por req.params.id em req.doc e usa doc.turma
 * - { somente: 'prof' }                  → só o professor da turma passa (ex.: escrita de conteúdo)
 * - { admin: true }                      → admin também passa, com vinculo 'adm' (ex.: GET /turmas/:id)
 */
export default function vinculoTurma({ model, somente, admin = false } = {}) {
  return async (req, _res, next) => {
    let turmaId = req.params.id;
    if (model) {
      req.doc = await model.findById(req.params.id);
      if (!req.doc) throw new HttpError(404, 'Não encontrado');
      turmaId = req.doc.turma;
    }

    req.turma = await Turma.findById(turmaId);
    if (!req.turma) throw new HttpError(404, 'Turma não encontrada');

    const { _id, role } = req.usuario;
    if (role === 'admin' && admin) req.vinculo = 'adm';
    else if (role === 'professor' && req.turma.professores.some((p) => p.equals(_id)))
      req.vinculo = 'prof';
    else if (role === 'aluno' && (await Matricula.exists({ aluno: _id, turma: req.turma._id })))
      req.vinculo = 'mat';
    else throw new HttpError(403, 'Você não faz parte desta turma');

    if (somente && req.vinculo !== somente) throw new HttpError(403, 'Acesso negado');
    next();
  };
}

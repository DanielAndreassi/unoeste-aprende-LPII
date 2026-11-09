import createError from 'http-errors';
import Turma from '../models/Turma.js';

/**
 * Callback para router.param(): carrega o documento do parâmetro em req[nomeDoModel em minúsculas].
 * Se o documento pertence a uma turma (campo `turma`), carrega também req.turma para o exigirVinculo.
 * O Express chama uma vez por requisição, antes dos handlers (Router API › router.param).
 *
 *   router.param('turmaId', carregar(Turma));        // → req.turma
 *   router.param('materialId', carregar(Material));  // → req.material + req.turma
 */
export default function carregar(Model) {
  const chave = Model.modelName.toLowerCase();

  return async (req, _res, next, id) => {
    const doc = await Model.findById(id); // id malformado → CastError → 400 no errorHandler
    if (!doc) throw createError(404, 'Registro não encontrado');
    req[chave] = doc;
    if (Model !== Turma && doc.turma) req.turma = await Turma.findById(doc.turma);
    next();
  };
}

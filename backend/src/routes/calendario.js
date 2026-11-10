import { Router } from 'express';
import createError from 'http-errors';
import carregar from '../middlewares/carregar.js';
import exigirVinculo from '../middlewares/exigirVinculo.js';
import Turma from '../models/Turma.js';
import Evento from '../models/Evento.js';
import * as eventos from '../controllers/eventoController.js';

const router = Router();

router.param('turmaId', carregar(Turma));

// Evento institucional (turma null) não é editado aqui: some para este endpoint (404), como em academico.js.
const carregarEvento = carregar(Evento);
router.param('eventoId', async (req, res, next, id) => {
  await carregarEvento(req, res, () => {}, id);
  if (!req.turma) throw createError(404, 'Registro não encontrado');
  next();
});

const membro = exigirVinculo('prof', 'mat');
const prof = exigirVinculo('prof');

router.get('/eventos', eventos.listarDoUsuario);
router
  .route('/turmas/:turmaId/eventos')
  .get(membro, eventos.listarDaTurma)
  .post(prof, eventos.criar);
router.route('/eventos/:eventoId').put(prof, eventos.atualizar).delete(prof, eventos.excluir);

export default router;

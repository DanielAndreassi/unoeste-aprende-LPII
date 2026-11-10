import { Router } from 'express';
import createError from 'http-errors';
import carregar from '../middlewares/carregar.js';
import exigirVinculo from '../middlewares/exigirVinculo.js';
import authorize from '../middlewares/authorize.js';
import Turma from '../models/Turma.js';
import Matricula from '../models/Matricula.js';
import Evento from '../models/Evento.js';
import * as matriculas from '../controllers/matriculaController.js';
import * as minhasTurmas from '../controllers/minhasTurmasController.js';
import * as eventos from '../controllers/eventoInstitucionalController.js';

const router = Router();

router.param('turmaId', carregar(Turma));
router.param('matriculaId', carregar(Matricula));

// Evento com turma não é institucional: some para este endpoint (404).
const carregarEvento = carregar(Evento);
router.param('eventoInstitucionalId', async (req, res, next, id) => {
  await carregarEvento(req, res, () => {}, id);
  if (req.evento.turma) throw createError(404, 'Registro não encontrado');
  next();
});

const membroOuAdm = exigirVinculo('prof', 'mat', 'adm');
const adm = exigirVinculo('adm');

router.get('/minhas-turmas', minhasTurmas.listar);
router.get('/turmas/:turmaId', membroOuAdm, minhasTurmas.obterTurma);
router.get('/turmas/:turmaId/participantes', membroOuAdm, matriculas.participantes);

router.route('/turmas/:turmaId/matriculas').get(adm, matriculas.listar).post(adm, matriculas.criar);
router.delete('/matriculas/:matriculaId', authorize('admin'), matriculas.excluir);

router.route('/eventos-institucionais').get(eventos.listar).post(authorize('admin'), eventos.criar);
router
  .route('/eventos-institucionais/:eventoInstitucionalId')
  .put(authorize('admin'), eventos.atualizar)
  .delete(authorize('admin'), eventos.excluir);

export default router;

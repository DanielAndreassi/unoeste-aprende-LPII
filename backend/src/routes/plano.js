import { Router } from 'express';
import carregar from '../middlewares/carregar.js';
import exigirVinculo from '../middlewares/exigirVinculo.js';
import Turma from '../models/Turma.js';
import * as plano from '../controllers/planoController.js';

const router = Router();

router.param('turmaId', carregar(Turma));

router
  .route('/turmas/:turmaId/plano')
  .get(exigirVinculo('prof', 'mat'), plano.obter)
  .put(exigirVinculo('prof'), plano.salvar);

export default router;

import { Router } from 'express';
import carregar from '../middlewares/carregar.js';
import exigirVinculo from '../middlewares/exigirVinculo.js';
import Turma from '../models/Turma.js';
import Conversa from '../models/Conversa.js';
import * as conversas from '../controllers/conversaController.js';

const router = Router();

router.param('turmaId', carregar(Turma));
router.param('conversaId', carregar(Conversa));

const membro = exigirVinculo('prof', 'mat');

router
  .route('/turmas/:turmaId/conversas')
  .get(membro, conversas.listar)
  .post(membro, conversas.criar);
router
  .route('/conversas/:conversaId')
  .get(membro, conversas.doDono, conversas.obter)
  .delete(membro, conversas.doDono, conversas.excluir);
router.post('/conversas/:conversaId/mensagens', membro, conversas.doDono, conversas.enviar);

export default router;

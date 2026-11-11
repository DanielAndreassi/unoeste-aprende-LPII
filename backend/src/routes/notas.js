import { Router } from 'express';
import carregar from '../middlewares/carregar.js';
import exigirVinculo from '../middlewares/exigirVinculo.js';
import Turma from '../models/Turma.js';
import Avaliacao from '../models/Avaliacao.js';
import * as avaliacoes from '../controllers/avaliacaoController.js';
import * as notas from '../controllers/notaController.js';

const router = Router();

router.param('turmaId', carregar(Turma));
router.param('avaliacaoId', carregar(Avaliacao));

const membro = exigirVinculo('prof', 'mat');
const prof = exigirVinculo('prof');

router
  .route('/turmas/:turmaId/avaliacoes')
  .get(prof, avaliacoes.listar)
  .post(prof, avaliacoes.criar);
router
  .route('/avaliacoes/:avaliacaoId')
  .put(prof, avaliacoes.atualizar)
  .delete(prof, avaliacoes.excluir);
router.put('/avaliacoes/:avaliacaoId/notas', prof, notas.lancar);
router.get('/turmas/:turmaId/notas', membro, notas.tabela);

export default router;

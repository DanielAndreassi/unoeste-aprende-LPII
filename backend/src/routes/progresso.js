import { Router } from 'express';
import carregar from '../middlewares/carregar.js';
import exigirVinculo from '../middlewares/exigirVinculo.js';
import Material from '../models/Material.js';
import * as progresso from '../controllers/progressoController.js';

const router = Router();

router.param('materialId', carregar(Material));

// Só o aluno matriculado marca progresso (api.md: mat).
const aluno = exigirVinculo('mat');

router
  .route('/materiais/:materialId/progresso')
  .put(aluno, progresso.marcar)
  .delete(aluno, progresso.desmarcar);

export default router;

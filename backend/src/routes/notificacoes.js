import { Router } from 'express';
import carregar from '../middlewares/carregar.js';
import Notificacao from '../models/Notificacao.js';
import * as notificacoes from '../controllers/notificacaoController.js';

const router = Router();

router.param('notificacaoId', carregar(Notificacao));

router.get('/notificacoes', notificacoes.listar);
router.patch('/notificacoes/lidas', notificacoes.marcarTodasLidas); // antes de /:notificacaoId
router.patch('/notificacoes/:notificacaoId/lida', notificacoes.doDono, notificacoes.marcarLida);
router.delete('/notificacoes/:notificacaoId', notificacoes.doDono, notificacoes.excluir);

export default router;

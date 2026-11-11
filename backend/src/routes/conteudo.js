import { Router } from 'express';
import carregar from '../middlewares/carregar.js';
import exigirVinculo from '../middlewares/exigirVinculo.js';
import { uploadMaterial } from '../config/uploads.js';
import Turma from '../models/Turma.js';
import Topico from '../models/Topico.js';
import Secao from '../models/Secao.js';
import Material from '../models/Material.js';
import * as conteudo from '../controllers/conteudoController.js';

const router = Router();

router.param('turmaId', carregar(Turma));
router.param('topicoId', carregar(Topico));
router.param('secaoId', carregar(Secao));
router.param('materialId', carregar(Material));

const membro = exigirVinculo('prof', 'mat');
const prof = exigirVinculo('prof');

router.get('/turmas/:turmaId/conteudo', membro, conteudo.arvore);
router.patch('/turmas/:turmaId/conteudo/ordem', prof, conteudo.reordenar);
router.post('/turmas/:turmaId/topicos', prof, conteudo.criarTopico);

router
  .route('/topicos/:topicoId')
  .put(prof, conteudo.atualizarTopico)
  .delete(prof, conteudo.excluirTopico);
router.post('/topicos/:topicoId/secoes', prof, conteudo.criarSecao);

router
  .route('/secoes/:secaoId')
  .put(prof, conteudo.atualizarSecao)
  .delete(prof, conteudo.excluirSecao);
// vínculo antes do multer: quem não pode não grava arquivo em disco
router.post('/secoes/:secaoId/materiais', prof, uploadMaterial, conteudo.criarMaterial);

router
  .route('/materiais/:materialId')
  .get(membro, conteudo.obterMaterial)
  .put(prof, conteudo.atualizarMaterial)
  .delete(prof, conteudo.excluirMaterial);
router.get('/materiais/:materialId/download', membro, conteudo.baixarMaterial);

export default router;

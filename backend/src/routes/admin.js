import { Router } from 'express';
import authorize from '../middlewares/authorize.js';
import carregar from '../middlewares/carregar.js';
import Usuario from '../models/Usuario.js';
import Curso from '../models/Curso.js';
import Disciplina from '../models/Disciplina.js';
import Turma from '../models/Turma.js';
import * as usuarios from '../controllers/usuarioController.js';
import * as cursos from '../controllers/cursoController.js';
import * as disciplinas from '../controllers/disciplinaController.js';
import * as turmas from '../controllers/turmaController.js';

const router = Router();
const adm = authorize('admin');

router.param('usuarioId', carregar(Usuario)); // → req.alvo
router.param('cursoId', carregar(Curso));
router.param('disciplinaId', carregar(Disciplina));
router.param('turmaId', carregar(Turma));

router.route('/usuarios').get(adm, usuarios.listar).post(adm, usuarios.criar);
router
  .route('/usuarios/:usuarioId')
  .get(adm, usuarios.obter)
  .put(adm, usuarios.atualizar)
  .delete(adm, usuarios.desativar);

router.route('/cursos').get(adm, cursos.listar).post(adm, cursos.criar);
router
  .route('/cursos/:cursoId')
  .get(adm, cursos.obter)
  .put(adm, cursos.atualizar)
  .delete(adm, cursos.excluir);

router.route('/disciplinas').get(adm, disciplinas.listar).post(adm, disciplinas.criar);
router
  .route('/disciplinas/:disciplinaId')
  .get(adm, disciplinas.obter)
  .put(adm, disciplinas.atualizar)
  .delete(adm, disciplinas.excluir);

router.route('/turmas').get(adm, turmas.listar).post(adm, turmas.criar);
// GET /turmas/:turmaId (membro/adm) fica com outro módulo.
router.route('/turmas/:turmaId').put(adm, turmas.atualizar).delete(adm, turmas.excluir);

export default router;

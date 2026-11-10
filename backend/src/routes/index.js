import { Router } from 'express';
import auth from '../middlewares/auth.js';
import authRoutes from './auth.js';
import perfilRoutes from './perfil.js';
import conteudoRoutes from './conteudo.js';
import academicoRoutes from './academico.js';
import adminRoutes from './admin.js';
import progressoRoutes from './progresso.js';
import calendarioRoutes from './calendario.js';
import notasRoutes from './notas.js';
import planoRoutes from './plano.js';
import assistenteRoutes from './assistente.js';

/*
 * Roteador da API. Cada módulo exporta um Router e é registrado aqui.
 * Dentro do módulo, o padrão é (ver docs/api.md):
 *
 *   router.param('turmaId', carregar(Turma));
 *   router.route('/turmas/:turmaId/topicos')
 *     .get(exigirVinculo('prof', 'mat'), topicos.listar)
 *     .post(exigirVinculo('prof'), topicos.criar);
 */
const router = Router();

// --- públicas ---
router.get('/health', (_req, res) => res.json({ ok: true }));
router.use(authRoutes);

// --- daqui para baixo tudo exige login (middleware no nível do router) ---
router.use(auth);
router.use(perfilRoutes);
router.use(conteudoRoutes);
router.use(academicoRoutes);
router.use(adminRoutes);
router.use(progressoRoutes);
router.use(calendarioRoutes);
router.use(notasRoutes);
router.use(planoRoutes);
router.use(assistenteRoutes);

export default router;

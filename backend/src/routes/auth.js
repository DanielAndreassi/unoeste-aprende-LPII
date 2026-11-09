import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import * as auth from '../controllers/authController.js';

const router = Router();

// 10 tentativas por 15 min por IP (ADR-0015)
const limitar = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  message: { erro: 'Muitas tentativas. Tente novamente em alguns minutos' },
});

router.post('/auth/login', limitar, auth.login);
router.post('/auth/forgot-password', limitar, auth.esqueciSenha);
router.post('/auth/reset-password', auth.redefinirSenha);

export default router;

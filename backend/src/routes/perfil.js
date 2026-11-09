import { Router } from 'express';
import { uploadAvatar } from '../config/uploads.js';
import * as perfil from '../controllers/perfilController.js';

const router = Router();

router.get('/auth/me', perfil.me);
router.put('/perfil', uploadAvatar, perfil.atualizar);
router.put('/perfil/senha', perfil.trocarSenha);

export default router;

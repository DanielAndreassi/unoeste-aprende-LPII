import { Router } from 'express';

// Cada módulo registra o seu roteador aqui: router.use(authRoutes), router.use(turmaRoutes)...
const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true }));

export default router;

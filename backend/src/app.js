import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import createError from 'http-errors';
import { UPLOADS_DIR } from './config/uploads.js';

const app = express();

// cross-origin: o front (outra porta) precisa exibir os avatares
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Única pasta pública (ADR-0005); materiais só saem pela rota autenticada de download.
app.use('/uploads/avatars', express.static(path.join(UPLOADS_DIR, 'avatars')));
app.use('/api', routes);
// Nenhuma rota respondeu: 404 no formato da API (o padrão do Express seria HTML)
app.use('/api', (_req, _res, next) => next(createError(404, 'Rota não encontrada')));

app.use(errorHandler);

export default app;

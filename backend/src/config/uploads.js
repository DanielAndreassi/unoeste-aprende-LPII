import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import createError from 'http-errors';
import multer from 'multer';

// backend/uploads/ — só uploads/avatars é público (ADR-0005).
export const UPLOADS_DIR = fileURLToPath(new URL('../../uploads/', import.meta.url));
export const AVATARES_DIR = path.join(UPLOADS_DIR, 'avatars');
export const MATERIAIS_DIR = path.join(UPLOADS_DIR, 'materiais'); // privada: só sai por /materiais/:id/download

const EXTENSOES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

// Avatar: ≤ 2 MB, jpg/png/webp, nome aleatório (ADR-0015). Campo multipart: "avatar".
export const uploadAvatar = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(AVATARES_DIR, { recursive: true });
      cb(null, AVATARES_DIR);
    },
    filename: (_req, file, cb) => cb(null, crypto.randomUUID() + EXTENSOES[file.mimetype]),
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    EXTENSOES[file.mimetype]
      ? cb(null, true)
      : cb(createError(400, 'Envie uma imagem jpg, png ou webp')),
}).single('avatar');

// Material: ≤ 20 MB, lista de extensões (o mimetype vem do cliente e não é confiável), nome aleatório (ADR-0015).
// Campo multipart: "arquivo". Requisições JSON (link/texto) passam direto pelo multer.
const EXTENSOES_MATERIAL = [
  '.pdf',
  '.zip',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.txt',
  '.png',
  '.jpg',
];

export const uploadMaterial = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(MATERIAIS_DIR, { recursive: true });
      cb(null, MATERIAIS_DIR);
    },
    filename: (_req, file, cb) =>
      cb(null, crypto.randomUUID() + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    EXTENSOES_MATERIAL.includes(path.extname(file.originalname).toLowerCase())
      ? cb(null, true)
      : cb(createError(400, 'Tipo de arquivo não permitido')),
}).single('arquivo');

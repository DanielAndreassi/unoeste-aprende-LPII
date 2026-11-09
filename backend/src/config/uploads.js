import { fileURLToPath } from 'node:url';

// backend/uploads/ — só uploads/avatars é público (ADR-0005).
export const UPLOADS_DIR = fileURLToPath(new URL('../../uploads/', import.meta.url));

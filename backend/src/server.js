import app from './app.js';
import { connectDB } from './config/db.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET não definido no .env — servidor não iniciado (ADR-0015).');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

await connectDB();
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));

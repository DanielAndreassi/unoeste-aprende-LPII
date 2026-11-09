import mongoose from 'mongoose';
import HttpError from '../utils/HttpError.js';

// Único tradutor de erros da API (ADR-0014). Formato: { erro, campos? }.
// Os 4 parâmetros são obrigatórios: é assim que o Express reconhece um handler de erro.
export default function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) return res.status(err.status).json({ erro: err.message });

  if (err instanceof mongoose.Error.ValidationError) {
    const campos = Object.fromEntries(Object.entries(err.errors).map(([k, e]) => [k, e.message]));
    return res.status(400).json({ erro: 'Dados inválidos', campos });
  }
  if (err instanceof mongoose.Error.CastError)
    return res.status(400).json({ erro: 'Identificador inválido' });
  if (err.code === 11000) return res.status(409).json({ erro: 'Registro já existe' });
  // erros do body-parser (JSON malformado) e do multer (arquivo grande demais)
  if (err.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido' });
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ erro: 'Arquivo muito grande' });

  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
}

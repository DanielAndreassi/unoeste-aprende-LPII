import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import multer from 'multer';

// Converte qualquer erro em [status, corpo] no formato único { erro, campos? } (ADR-0014).
function traduzir(err) {
  // JsonWebTokenError inclui TokenExpiredError e NotBeforeError
  if (err instanceof jwt.JsonWebTokenError)
    return [401, { erro: 'Sessão inválida ou expirada, faça login novamente' }];
  if (err instanceof mongoose.Error.ValidationError) {
    const campos = Object.fromEntries(Object.entries(err.errors).map(([k, e]) => [k, e.message]));
    return [400, { erro: 'Dados inválidos', campos }];
  }
  if (err instanceof mongoose.Error.CastError) return [400, { erro: 'Identificador inválido' }];
  if (err.code === 11000) return [409, { erro: 'Registro já existe' }];
  if (err instanceof multer.MulterError)
    return [
      400,
      { erro: err.code === 'LIMIT_FILE_SIZE' ? 'Arquivo muito grande' : 'Upload inválido' },
    ];
  if (err.type === 'entity.parse.failed') return [400, { erro: 'JSON inválido' }];
  // http-errors (nossos e os do body-parser): expose = mensagem segura para o cliente
  if (err.expose) return [err.status, { erro: err.message }];
  return [500, { erro: 'Erro interno do servidor' }];
}

// Os 4 parâmetros são obrigatórios: é assim que o Express reconhece um handler de erro.
export default function errorHandler(err, _req, res, next) {
  // resposta já começou a ser enviada → delega ao handler padrão do Express (guia "Error handling")
  if (res.headersSent) return next(err);

  const [status, corpo] = traduzir(err);
  if (status >= 500) console.error(err);
  res.status(status).json(corpo);
}

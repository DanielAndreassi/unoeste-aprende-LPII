import createError from 'http-errors';

// Middleware configurável (padrão do guia "Writing middleware"): authorize('admin'), authorize('professor', 'aluno').
export default function authorize(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.usuario.role)) throw createError(403, 'Acesso negado');
    next();
  };
}

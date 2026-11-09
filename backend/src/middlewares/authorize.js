import HttpError from '../utils/HttpError.js';

// Uso: router.get('/x', auth, authorize('admin'), ...)
export default function authorize(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.usuario?.role)) throw new HttpError(403, 'Acesso negado');
    next();
  };
}

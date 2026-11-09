import createError from 'http-errors';

/**
 * Exige vínculo com req.turma (carregada antes via router.param + carregar) e expõe req.vinculo.
 * Mesmo padrão do authorize(...roles):
 *
 *   exigirVinculo('prof')               → só o professor da turma
 *   exigirVinculo('prof', 'mat')        → membro (api.md)
 *   exigirVinculo('prof', 'mat', 'adm') → membro ou admin
 */
export default function exigirVinculo(...permitidos) {
  return async (req, _res, next) => {
    req.vinculo = await req.turma.vinculoDe(req.usuario);
    if (!permitidos.includes(req.vinculo))
      throw createError(403, 'Você não tem acesso a esta turma');
    next();
  };
}

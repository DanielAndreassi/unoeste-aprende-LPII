// ADR-0015: mínimo 8 caracteres, ao menos uma letra e um número. Devolve a mensagem de erro ou null.
export function validarSenha(senha) {
  if (typeof senha !== 'string' || senha.length < 8)
    return 'A senha deve ter pelo menos 8 caracteres';
  if (!/[a-zA-Z]/.test(senha) || !/\d/.test(senha))
    return 'A senha deve ter pelo menos uma letra e um número';
  return null;
}

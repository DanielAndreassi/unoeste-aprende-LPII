// ADR-0007: média ponderada calculada na leitura, nunca persistida.
export const MEDIA_APROVACAO = 6;

// avaliacoes: [{ peso, valor }] — valor null/undefined = nota ainda não lançada
export function calcularMedia(avaliacoes) {
  let soma = 0;
  let pesos = 0;
  for (const { peso, valor } of avaliacoes) {
    if (valor == null) continue;
    soma += valor * peso;
    pesos += peso;
  }
  return pesos ? Math.round((soma / pesos) * 100) / 100 : null;
}

export function situacao(avaliacoes) {
  const media = calcularMedia(avaliacoes);
  const todasLancadas = avaliacoes.length > 0 && avaliacoes.every((a) => a.valor != null);
  if (!todasLancadas) return 'Em andamento';
  return media >= MEDIA_APROVACAO ? 'Aprovado' : 'Reprovado';
}

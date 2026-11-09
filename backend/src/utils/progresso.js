// % inteiro de materiais concluídos; turma sem materiais = 0.
export function percentual(concluidos, total) {
  return total ? Math.round((concluidos / total) * 100) : 0;
}

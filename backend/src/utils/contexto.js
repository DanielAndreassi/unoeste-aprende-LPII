// Monta o contexto da turma que o assistente recebe (ADR-0003). Função pura.
// shortcut: corte fixo de caracteres, não de tokens; trocar por contagem de tokens se o contexto estourar.
const MAX_TEXTO = 4000;
const MAX_TOTAL = 40000;

const corta = (s, n) => (s.length > n ? `${s.slice(0, n)}… [cortado]` : s);

// topicos: [{ titulo, secoes: [{ titulo, materiais: [{ titulo, descricao, tipo, conteudo }] }] }]
// eventos: [{ titulo, tipo, inicio, fim }]
export function montarContexto({ rotulo, plano, topicos, eventos }) {
  const partes = [`# Disciplina: ${rotulo}`];

  const campos = [
    ['Ementa', plano?.ementa],
    ['Objetivos', plano?.objetivos],
    ['Conteúdo programático', plano?.conteudoProgramatico],
    ['Avaliação', plano?.avaliacao],
    ['Bibliografia', plano?.bibliografia],
  ].filter(([, v]) => v?.trim());
  partes.push('## Plano de ensino');
  partes.push(
    campos.length
      ? campos.map(([t, v]) => `### ${t}\n${v.trim()}`).join('\n\n')
      : '(não cadastrado)',
  );

  partes.push('## Conteúdo da disciplina');
  for (const t of topicos)
    for (const s of t.secoes) {
      partes.push(`### ${t.titulo} › ${s.titulo}`);
      for (const m of s.materiais) {
        const desc = m.descricao ? ` — ${m.descricao}` : '';
        partes.push(`- (${m.tipo}) ${m.titulo}${desc}`);
        if (m.tipo === 'texto' && m.conteudo) partes.push(corta(m.conteudo, MAX_TEXTO));
      }
    }

  partes.push('## Eventos');
  const data = (d) =>
    new Date(d).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'short',
      timeStyle: 'short',
    });
  partes.push(
    eventos.length
      ? eventos
          .map((e) => `- ${e.titulo} (${e.tipo}): ${data(e.inicio)} a ${data(e.fim)}`)
          .join('\n')
      : '(nenhum)',
  );

  return corta(partes.join('\n\n'), MAX_TOTAL);
}

// Primeiro instante do dia em São Paulo (UTC-3 fixo, como o front em utils/datas.js).
export function inicioDoDia(agora = new Date()) {
  const dia = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(agora);
  return new Date(`${dia}T00:00:00-03:00`);
}

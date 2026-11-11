// Eventos institucionais: a API guarda ISO UTC; a tela trabalha em horário de São Paulo.
// shortcut: offset fixo -03:00 em localParaIso (Brasil sem horário de verão desde 2019), trocar por cálculo do fuso se a regra mudar.
const FUSO = 'America/Sao_Paulo';

export function paraExibicao(iso) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: FUSO,
  }).format(new Date(iso));
}

// ISO UTC → valor de <input type="datetime-local"> (AAAA-MM-DDTHH:mm, horário de São Paulo)
export function isoParaLocal(iso) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: FUSO,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date(iso))
      .map(({ type, value }) => [type, value]),
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

// valor do datetime-local (horário de São Paulo) → ISO UTC
export function localParaIso(local) {
  return new Date(`${local}:00-03:00`).toISOString();
}

// --- Calendário: dias como chave AAAA-MM-DD no fuso de São Paulo (comparação de texto ordena certo) ---

// ISO ou Date → dia civil em São Paulo
export function chaveDia(data) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(data));
}

// Grade do mês (mes = 1 a 12): 6 semanas de domingo a sábado, sempre 42 chaves
export function gradeDoMes(ano, mes) {
  const primeiro = Date.UTC(ano, mes - 1, 1);
  const inicio = primeiro - new Date(primeiro).getUTCDay() * 86400000;
  return Array.from({ length: 42 }, (_, i) =>
    new Date(inicio + i * 86400000).toISOString().slice(0, 10),
  );
}

export function somarDias(chave, dias) {
  const [a, m, d] = chave.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

export function rotuloMes(ano, mes) {
  const texto = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(ano, mes - 1, 15)));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function rotuloDia(chave) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${chave}T12:00:00Z`));
}

// "16:00" em São Paulo
export function hora(iso) {
  return new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short', timeZone: FUSO }).format(
    new Date(iso),
  );
}

// chave AAAA-MM-DD → "qui., 12 de nov."
export function diaCurto(chave) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${chave}T12:00:00Z`));
}

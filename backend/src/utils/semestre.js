// Janeiro a junho = 1, julho a dezembro = 2 → "2/2026".
export function semestreAtual(data = new Date()) {
  return `${data.getMonth() < 6 ? 1 : 2}/${data.getFullYear()}`;
}

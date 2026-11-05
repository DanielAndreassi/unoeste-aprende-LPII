# ADR-0016: Entrega (ZIP)

- Status: Aceita
- Data: 2026-11-05

## Decisão
- ZIP gerado a partir da `main` com `git archive --format=zip -o entrega.zip main`.
- **Entra:** código, `README.md` (nomes da dupla, como rodar com `docker compose up` + seed, credenciais de demonstração), `.env.example`, `docs/`, `docker-compose.yml`.
- **Não entra:** `node_modules`, `.env`, `uploads/`, `dist/` (todos no `.gitignore`).

## Consequências
- O `git archive` respeita o que o Git ignora, então é impossível vazar segredos no ZIP.
- Antes de gerar, conferir que o `README.md` tem os nomes: Daniel Andreassi Lopes e Henrique Corazza.

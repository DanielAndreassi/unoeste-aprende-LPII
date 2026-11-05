# ADR-0009: Fluxo Git e convenções de código

- Status: Aceita
- Data: 2026-11-05

## Decisão
- `main` sempre funcionando. Trabalho em `feat/<modulo>` (ex.: `feat/notas`) ou `fix/<assunto>`.
- PR para `main`, revisado pelo outro membro antes do merge.
- Commits em português no padrão Conventional Commits: `feat(notas): calcula média ponderada`.
- Nomes de domínio em **português** (models, coleções, rotas: `/api/turmas`, `Material`, `Avaliacao`), sem acentos em identificadores. Código auxiliar pode ficar em inglês.

- Formatação: `.prettierrc` único na raiz, formatar ao salvar. Sem ESLint.
- Sem CI: rodar `node --test` localmente antes de abrir PR.
- Interface só em pt-BR, sem i18n.

## Consequências
- Mudança em model compartilhado ou no seed avisa o colega no PR.

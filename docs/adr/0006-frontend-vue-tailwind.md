# ADR-0006: Frontend — Vue Router + Pinia + Axios + Tailwind

- Status: Aceita
- Data: 2026-11-05

## Contexto
O objetivo é ser "mais bonito" que o original, com rotas protegidas por perfil e um JWT em toda requisição.

## Decisão
- **Vue Router**: rotas com `meta.roles`; um guard global redireciona para o login ou bloqueia por perfil.
- **Pinia**: store `auth` (token, usuário, role) persistida em localStorage; stores por domínio quando precisar.
- **Axios**: instância única com `baseURL`. Um interceptor injeta o `Bearer` e, em 401, faz logout.
- **Tailwind CSS**: estilo próprio, sem biblioteca de componentes.

## Estrutura
```
src/
  api/         http.js (axios + interceptors) + 1 arquivo por recurso
  stores/      auth, notificacoes, tema
  router/      index.js (guards por meta.roles)
  layouts/     AuthLayout, AppLayout, TurmaLayout
  views/       auth/ home/ turma/ admin/ perfil/ calendario/
  components/  ui/ (Botao, Card, Modal, Toast, Skeleton, MarkdownView…) + por domínio
  utils/       datas, markdown
```

## Telas iniciais por papel
- Aluno: cards das turmas com barra de progresso + calendário.
- Professor: cards com a quantidade de alunos + calendário.
- Admin: painel com contadores e atalhos para os CRUDs (AppLayout com menu de administração).

## Edição de conteúdo (professor)
Botão "Modo edição" na própria página de Conteúdo; reordenação por botões ↑/↓ (sem arrastar e soltar).

## Feedback
Toast de sucesso/erro (lê `{erro}` da API), modal de confirmação antes de toda exclusão, esqueleto de carregamento nas listas.

## Consequências
- Componentes base (Botão, Card, Modal, Input, Tabela) feitos à mão, uma vez, em `components/ui/`.
- Calendário feito à mão com grid do Tailwind (sem lib).
- Identidade e extras de UX: [docs/design.md](../design.md)

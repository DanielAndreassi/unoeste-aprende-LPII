# AGENTS.md — Aprender Unoeste (clone LP2)

> Regras brutas do projeto. Detalhes nos arquivos linkados. Status: **setup comum (06/11) pronto na `feat/setup`** — models, middlewares, seed mínimo e front base; módulos A/B partem daqui.

## Contexto
- Clone melhorado do "Aprender Unoeste" (AVA da faculdade): mais bonito e com melhores funcionalidades. Tema validado com o professor.
- Trabalho prático de LP II. Dupla: **Daniel Andreassi Lopes (A)** e **Henrique Corazza (B)**.
- Prazo: entrega e apresentação em **16/11/2026**. Na dúvida, priorizar o que conta nota.
- Requisitos: [docs/requisitos.md](docs/requisitos.md) · Entrevista: [docs/entrevista.md](docs/entrevista.md) · ADRs: [docs/adr/README.md](docs/adr/README.md)

## Escopo e domínio
- Telas: [docs/escopo.md](docs/escopo.md) · Modelo: [docs/modelo-dados.md](docs/modelo-dados.md) · Regras por módulo: [docs/regras-negocio.md](docs/regras-negocio.md)
- Perfis Admin/Professor/Aluno, **um por usuário**; autorização = papel + vínculo com a turma → [ADR-0002](docs/adr/0002-perfis-e-permissoes.md)
- Curso → Disciplina → Turma → Matrícula; conteúdo Tópico → Seção → Material (arquivo/link/texto) → [ADR-0010](docs/adr/0010-estrutura-academica-e-conteudo.md)
- Notas: média ponderada calculada na leitura (nunca persistida), aprovação com média ≥ 6 → [ADR-0007](docs/adr/0007-notas-media-ponderada.md)
- IA: assistente da disciplina (Gemini), chamado só pelo backend, conversas salvas, para aluno e professor da turma → [ADR-0003](docs/adr/0003-ia-assistente-disciplina.md)
- Sem autocadastro; usuário é desativado, nunca apagado; 409 ao excluir com dependentes; cascata em Tópico/Seção → [ADR-0012](docs/adr/0012-contas-e-exclusoes.md)
- **Não implementar** o que está em [ADR-0011](docs/adr/0011-fora-do-escopo.md) (entregas, frequência, coordenador, mensagens, autocadastro, IA lendo PDF).

## Backend
- Stack obrigatória: Node + Express 5 + Mongoose + JavaScript ESM → [ADR-0001](docs/adr/0001-stack-obrigatoria.md)
- **MVC estrito, sem `services/`**: lógica compartilhada em models (métodos/statics/hooks), `utils/` (funções puras) e `config/` (clientes de e-mail/IA) → [ADR-0014](docs/adr/0014-backend-mvc-erros-validacao.md)
- Controllers sem try/catch: `createError` (`http-errors`) + `errorHandler` único; validação no schema Mongoose → ADR-0014
- Rotas: `router.use(auth)` após as públicas; `router.param('<x>Id', carregar(Model))`; `exigirVinculo('prof','mat',...)` e `authorize(...roles)`; `router.route()` por caminho → ADR-0014
- Contrato da API: seguir [docs/api.md](docs/api.md); mudanças atualizam o doc no mesmo PR.
- Auth: JWT Bearer 8h + bcrypt; reset de senha e boas-vindas por e-mail, guardando só o hash do token → [ADR-0004](docs/adr/0004-autenticacao-jwt.md)
- Segurança: auth checa `ativo`, helmet, CORS, rate limit, limites de upload; lista de `.env` → [ADR-0015](docs/adr/0015-seguranca.md)
- Uploads: multer, download só por rota autenticada (só avatares são públicos) → [ADR-0005](docs/adr/0005-uploads-multer.md)
- Segredos só em `.env`. Nunca commitar.

## Frontend
- Vue 3 + Router (guard por `meta.roles`) + Pinia + Axios com interceptor JWT + Tailwind, sem biblioteca de componentes → [ADR-0006](docs/adr/0006-frontend-vue-tailwind.md)
- Markdown só via `MarkdownView` (`markdown-it`, `html:false`); proibido `v-html` com conteúdo de usuário → [ADR-0013](docs/adr/0013-markdown-seguro.md)
- Visual: verde Unoeste repaginado, modo escuro, responsivo, notificações, progresso, VLibras → [docs/design.md](docs/design.md)
- Interface só em pt-BR.

## Ambiente e qualidade
- Tudo via `docker compose up` (desenvolvimento com hot reload). Seed manual `docker compose exec backend npm run seed` com pessoas fictícias; o seed deve acompanhar toda mudança de model → [ADR-0008](docs/adr/0008-mongo-local-seed.md)
- Testes: `node:test` nas funções puras + coleção de requisições da API → [docs/testes.md](docs/testes.md)
- Git: `feat/<modulo>` + PR revisado; Conventional Commits em PT; domínio em português; Prettier único na raiz; sem ESLint e sem CI → [ADR-0009](docs/adr/0009-fluxo-git.md)

## Execução e entrega
- Divisão, cronograma e ordem de corte: [docs/plano.md](docs/plano.md)
- ZIP via `git archive` da `main`; README com nomes → [ADR-0016](docs/adr/0016-entrega.md)
- Roteiro da apresentação: [docs/apresentacao.md](docs/apresentacao.md)

## Pendente
- Nada bloqueante. O nome exato do modelo Gemini é confirmado na implementação.

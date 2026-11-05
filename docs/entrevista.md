# Entrevista de planejamento

## Rodada 1 — escopo (2026-11-05)
- Perfis: **Aluno, Professor, Admin** → [ADR-0002](adr/0002-perfis-e-permissoes.md)
- Módulos do MVP (todos): Conteúdo (seções + materiais), Notas, Calendário/Eventos, Participantes/Professores, Plano de Ensino → [escopo.md](escopo.md)
- IA: **Assistente da disciplina** (chat com base no conteúdo/plano da matéria) → [ADR-0003](adr/0003-ia-assistente-disciplina.md)
- Prazo: **entrega 16/11/2026** (11 dias a partir de 05/11) — escopo grande para o prazo; priorizar.

## Rodada 2 — auth, IA, arquivos (2026-11-05)
- Auth: JWT no header → [ADR-0004](adr/0004-autenticacao-jwt.md)
- Reset de senha: e-mail real com link/token → [ADR-0004](adr/0004-autenticacao-jwt.md)
- LLM: Google Gemini → [ADR-0003](adr/0003-ia-assistente-disciplina.md)
- Materiais: upload local com multer → [ADR-0005](adr/0005-uploads-multer.md)

## Rodada 3 — frontend/design (2026-11-05)
- UI: Tailwind; Router + Pinia + Axios → [ADR-0006](adr/0006-frontend-vue-tailwind.md)
- Identidade: verde Unoeste repaginado → [design.md](design.md)
- Extras: modo escuro, responsivo, notificações in-app, barra de progresso → [design.md](design.md)

## Rodada 4 — domínio/infra (2026-11-05)
- Notas: avaliações com peso + média automática → [ADR-0007](adr/0007-notas-media-ponderada.md)
- Banco: local/Docker; seed realista → [ADR-0008](adr/0008-mongo-local-seed.md)
- Divisão: por módulo (fullstack) → [plano.md](plano.md)

## Rodada 5 — equipe/convenções (2026-11-05)
- A: Auth+Admin+Notas+Notificações · B: Conteúdo+Calendário+Plano+IA → [plano.md](plano.md)
- Git: branch por feature + PR → [ADR-0009](adr/0009-fluxo-git.md)
- Chat da IA salvo no Mongo → [ADR-0003](adr/0003-ia-assistente-disciplina.md)
- Domínio em português → [ADR-0009](adr/0009-fluxo-git.md)

## Grilling 1 — estrutura do domínio (2026-11-05) — todas as recomendações aceitas
1. Disciplina (catálogo) separada de Turma (oferta) → [ADR-0010](adr/0010-estrutura-academica-e-conteudo.md)
2. Conteúdo em 3 níveis: Tópico → Seção → Material → ADR-0010
3. Material: arquivo, link, texto (Markdown) → ADR-0010
4. Entrega de atividades fora do MVP → [ADR-0011](adr/0011-fora-do-escopo.md)
5. Frequência fora → ADR-0011
6. Sem coordenador nem Sala do Coordenador → ADR-0011
7. Sem autocadastro; e-mail de boas-vindas para definir a senha → [ADR-0012](adr/0012-contas-e-exclusoes.md)
8. Um papel por usuário → ADR-0012
9. Header: Meu perfil; Recursos Globais e mensagens fora → ADR-0011, [escopo.md](escopo.md)
10. VLibras + acessibilidade básica → [design.md](design.md)
11. IA sem conteúdo de PDF no MVP → [ADR-0003](adr/0003-ia-assistente-disciplina.md)
12. IA para aluno e professor → ADR-0003
13. Exclusões: desativar usuário, 409, cascata em Tópico/Seção → ADR-0012

## Grilling 2 — comportamento dos módulos (2026-11-05) — todas aceitas
Markdown seguro ([ADR-0013](adr/0013-markdown-seguro.md)); descrição no material; sem rascunho; progresso manual; semestre calculado; tipos e cores de evento; eventos institucionais; calendário em 3 visões; notificações só para aluno com polling de 60 s; professor vê % por aluno; avatar público com iniciais como fallback; limites da IA (30/dia, 10 msgs de contexto); plano de ensino com 5 campos em Markdown; matrícula em lote → [regras-negocio.md](regras-negocio.md)

## Grilling 3 — arquitetura, segurança e qualidade do backend (2026-11-05)
- Q1 **alterada**: MVC estrito, sem services → [ADR-0014](adr/0014-backend-mvc-erros-validacao.md)
- Q14 **alterada**: tudo em Docker (Mongo, backend e frontend) → [ADR-0008](adr/0008-mongo-local-seed.md)
- Aceitas (grilling 3): validação no Mongoose, errorHandler único, auth checa `ativo`, política de senha, helmet + CORS + rate limit, `turma` duplicado nos recursos + middleware `vinculoTurma`, UTC + Intl, testes com node:test + coleção de requisições, Gmail/Ethereal, lista de `.env`, paginação só em usuários, limites de upload → ADR-0014, [ADR-0015](adr/0015-seguranca.md), [testes.md](testes.md)

## Grilling 4 — consequências de MVC/Docker, front e seed (2026-11-05) — todas aceitas
- Fat models + utils + config (sem services) → [ADR-0014](adr/0014-backend-mvc-erros-validacao.md)
- Um compose de desenvolvimento com hot reload; volumes nomeados; seed manual; pessoas fictícias; credenciais `Senha123` → [ADR-0008](adr/0008-mongo-local-seed.md)
- Estrutura do front, telas iniciais por papel, "Modo edição" com ↑/↓, toast/modal/esqueleto → [ADR-0006](adr/0006-frontend-vue-tailwind.md)
- Dupla: Daniel Andreassi Lopes e Henrique Corazza → [plano.md](plano.md)

## Grilling 5 — divisão, entrega e apresentação (2026-11-05) — todas aceitas
- A = Daniel Andreassi Lopes · B = Henrique Corazza → [plano.md](plano.md)
- 06/11 juntos: Docker, todos os models, middlewares e layout base → [plano.md](plano.md)
- Tema já validado com o professor → [requisitos.md](requisitos.md)
- Prettier sem ESLint; sem CI; só pt-BR → [ADR-0009](adr/0009-fluxo-git.md)
- ZIP via `git archive` → [ADR-0016](adr/0016-entrega.md)
- Roteiro da apresentação → [apresentacao.md](apresentacao.md)
- Modo escuro segue o sistema operacional → [design.md](design.md)
- Modelo Gemini por variável de ambiente → [ADR-0003](adr/0003-ia-assistente-disciplina.md)

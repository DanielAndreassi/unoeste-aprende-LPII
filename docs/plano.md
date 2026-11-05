# Plano de execução (05/11 → 16/11/2026)

## Divisão (fullstack por módulo)
| Membro | Módulos |
|---|---|
Dupla: **Daniel Andreassi Lopes** e **Henrique Corazza**.

| Membro | Módulos |
|---|---|
| **A — Daniel Andreassi Lopes** | Auth (login, JWT, reset por e-mail, boas-vindas), Perfil, Admin (usuários, cursos, disciplinas, turmas, matrículas, eventos institucionais), Notas, Notificações |
| **B — Henrique Corazza** | Conteúdo (tópicos, seções, materiais, upload, progresso), Calendário/Eventos, Plano de Ensino, Assistente IA |
| **Juntos** | Setup (Docker), layout base (header, menu lateral, tema/dark mode), Home, seed, README, apresentação |

## Cronograma
| Dia | Entrega |
|---|---|
| 05/11 | Docs fechados (tema já validado com o professor) |
| 06/11 | **Juntos (bloqueia o resto)**: docker-compose, `.prettierrc`, **todos os models** (schemas), middlewares `auth`/`authorize`/`vinculoTurma`/`errorHandler`, `HttpError`, seed mínimo, front base (Tailwind, Router, Pinia, Axios, layouts) |
| 07–08/11 | A: auth + reset + boas-vindas + guards + perfil · B: CRUD de tópicos/seções/materiais/upload |
| 09–10/11 | A: admin CRUD · B: progresso + eventos + calendário |
| 11–12/11 | A: avaliações/notas/média · B: plano de ensino + assistente IA |
| 13/11 | A: notificações · B: polimento do chat · Juntos: Home (cards + progresso + eventos) |
| 14/11 | Responsivo, dark mode, seed completo, correção de bugs |
| 15/11 | Ensaio cronometrado ([apresentacao.md](apresentacao.md)), README, ZIP ([ADR-0016](adr/0016-entrega.md)) |
| **16/11** | **Entrega + apresentação** |

Se atrasar, cortar nesta ordem: notificações → dark mode → histórico do chat salvo.

## Fluxo de trabalho
→ [ADR-0009](adr/0009-fluxo-git.md)

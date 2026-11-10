# Contrato da API (rascunho)

Base: `/api`. JSON. Auth: `Authorization: Bearer <jwt>` (exceto `/auth/*`).
Legenda de acesso: **adm** admin · **prof** professor da turma · **mat** aluno matriculado · **membro** prof ou mat · **auth** qualquer logado.
Erros: `{ "erro": "mensagem" }` com status 400/401/403/404/409/500.

## Auth e perfil — membro A

| Método | Rota                                                     | Acesso                                                                                                    |
| ------ | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| POST   | /auth/login `{ email, senha }` → `{ token, usuario }`    | público (401 se credenciais erradas ou `ativo:false`; 10 tentativas/15 min por IP)                        |
| POST   | /auth/forgot-password `{ email }`                        | público (sempre 200; mesmo limite do login)                                                               |
| POST   | /auth/reset-password `{ token, senha }`                  | público (token do e-mail, 30 min; também usado na primeira senha; 400 se inválido)                        |
| GET    | /auth/me → usuário                                       | auth                                                                                                      |
| PUT    | /perfil (multipart: `nome`, `avatar` opcional) → usuário | auth (avatar jpg/png/webp ≤ 2 MB; guardado como nome de arquivo, servido em `/uploads/avatars/<arquivo>`) |
| PUT    | /perfil/senha `{ senhaAtual, senhaNova }`                | auth (400 se a atual estiver errada)                                                                      |

Roteiro de requisições: [backend/requests/auth.http](../backend/requests/auth.http).

## Admin — membro A

| Método                    | Rota                                                                                                                                                                           | Acesso                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| GET/POST · GET/PUT/DELETE | /usuarios · /usuarios/:id                                                                                                                                                      | adm (POST envia e-mail de boas-vindas; DELETE = desativar) |
| GET/POST · GET/PUT/DELETE | /cursos · /cursos/:id                                                                                                                                                          | adm (DELETE 409 se tiver disciplinas)                      |
| GET/POST · GET/PUT/DELETE | /disciplinas · /disciplinas/:id                                                                                                                                                | adm (DELETE 409 se tiver turmas)                           |
| GET/POST · PUT/DELETE     | /turmas · /turmas/:id                                                                                                                                                          | adm (DELETE 409 se tiver matrículas/conteúdo)              |
| GET                       | /turmas/:id                                                                                                                                                                    | membro, adm                                                |
| GET/POST · DELETE         | /turmas/:id/matriculas (POST `{ alunos: [ids] }` → 201 `{ criadas, ignoradas }`; 400 e nada gravado se algum id não for aluno ativo) · /matriculas/:id (não apaga o progresso) | adm                                                        |
| GET/POST · PUT/DELETE     | /eventos-institucionais · /eventos-institucionais/:id                                                                                                                          | GET auth · resto adm                                       |

## Turma do usuário

| Método | Rota                           | Acesso                                                                                                                                                                                                   |
| ------ | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | /minhas-turmas?semestre=2/2026 | auth → `{ semestre, semestres, cursos: [{ curso, turmas: [{ _id, codigo, semestre, disciplina, rotulo, progresso (aluno) \| totalAlunos (prof/adm) }] }] }`; sem `semestre` usa o atual; 400 se inválido |
| GET    | /turmas/:id/participantes      | membro (prof recebe também o % de cada aluno)                                                                                                                                                            |

## Conteúdo — membro B

| Método         | Rota                                                                                                                                            | Acesso                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| GET            | /turmas/:id/conteudo (árvore Tópico→Seção→Material; cada material traz `concluido` para o aluno; o caminho do arquivo em disco nunca é exposto) | membro (admin não)                                                                                     |
| POST           | /turmas/:id/topicos                                                                                                                             | prof                                                                                                   |
| PUT/DELETE     | /topicos/:id `{ titulo }`                                                                                                                       | prof (DELETE em cascata, 204)                                                                          |
| POST           | /topicos/:id/secoes                                                                                                                             | prof                                                                                                   |
| PUT/DELETE     | /secoes/:id                                                                                                                                     | prof (DELETE em cascata)                                                                               |
| POST           | /secoes/:id/materiais (multipart p/ `tipo=arquivo`, campo `arquivo`, ≤ 20 MB, extensões do ADR-0015; JSON p/ link/texto)                        | prof                                                                                                   |
| GET/PUT/DELETE | /materiais/:id                                                                                                                                  | GET membro · PUT/DELETE prof (PUT edita título, descrição, url/conteúdo; não troca `tipo` nem arquivo) |
| GET            | /materiais/:id/download                                                                                                                         | membro                                                                                                 |
| PUT/DELETE     | /materiais/:id/progresso                                                                                                                        | mat                                                                                                    |
| PATCH          | /turmas/:id/conteudo/ordem `{ nivel: 'topicos'\|'secoes'\|'materiais', pai?, ids: [...] }`                                                      | prof (`pai` = id do tópico ou da seção; `ids` = todos os irmãos na nova ordem; 204)                    |

## Calendário — membro B

| Método     | Rota                     | Acesso                                                |
| ---------- | ------------------------ | ----------------------------------------------------- |
| GET        | /eventos?de=&ate=&turma= | auth (eventos das turmas do usuário + institucionais) |
| GET/POST   | /turmas/:id/eventos      | GET membro · POST prof                                |
| PUT/DELETE | /eventos/:id             | prof                                                  |

## Plano de Ensino — membro B

| GET/PUT | /turmas/:id/plano | GET membro (sem plano devolve os 5 campos vazios) · PUT prof (upsert; 400 se algum campo não for texto) |
| ------- | ----------------- | ------------------------------------------------------------------------------------------------------- |

## Notas — membro A

| Método     | Rota                                                                                                                                                                      | Acesso                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| GET/POST   | /turmas/:id/avaliacoes `{ nome, peso, data? }`                                                                                                                            | prof                                           |
| PUT/DELETE | /avaliacoes/:id                                                                                                                                                           | prof (DELETE apaga as notas da avaliação, 204) |
| PUT        | /avaliacoes/:id/notas (lote `[{aluno, valor}]`; `valor: null` apaga a nota; 204; 400 e nada gravado se algum aluno não for da turma, nota fora de 0–10 ou aluno repetido) | prof                                           |
| GET        | /turmas/:id/notas → `{ avaliacoes: [...], alunos: [{ aluno: {_id, nome, email, avatar}, notas: { <avaliacaoId>: valor\|null }, media, situacao }] }`                      | prof: todos os alunos · mat: só o próprio      |

## Notificações — membro A

| GET | /notificacoes · PATCH /notificacoes/:id/lida · PATCH /notificacoes/lidas · DELETE /notificacoes/:id | auth (só as próprias) |
| --- | --------------------------------------------------------------------------------------------------- | --------------------- |

## Assistente IA — membro B

| Método     | Rota                                                                                                                                                                                                   | Acesso                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| GET/POST   | /turmas/:id/conversas                                                                                                                                                                                  | membro (só as próprias) |
| GET/DELETE | /conversas/:id                                                                                                                                                                                         | dono                    |
| POST       | /conversas/:id/mensagens `{ texto }` → a conversa inteira + `restantes` (perguntas que sobram hoje, de 30). 429 após 30/dia; 503 se o Gemini estiver sem cota ou fora do ar (a pergunta não é gravada) | dono                    |

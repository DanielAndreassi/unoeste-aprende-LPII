# Contrato da API (rascunho)

Base: `/api`. JSON. Auth: `Authorization: Bearer <jwt>` (exceto `/auth/*`).
Legenda de acesso: **adm** admin · **prof** professor da turma · **mat** aluno matriculado · **membro** prof ou mat · **auth** qualquer logado.
Erros: `{ "erro": "mensagem" }` com status 400/401/403/404/409/500.

## Auth e perfil — membro A
| Método | Rota | Acesso |
|---|---|---|
| POST | /auth/login | público (bloqueia `ativo:false`) |
| POST | /auth/forgot-password | público |
| POST | /auth/reset-password | público (token; também usado na primeira senha) |
| GET | /auth/me | auth |
| PUT | /perfil | auth (nome, avatar) |
| PUT | /perfil/senha | auth (senha atual + nova) |

## Admin — membro A
| Método | Rota | Acesso |
|---|---|---|
| GET/POST · GET/PUT/DELETE | /usuarios · /usuarios/:id | adm (POST envia e-mail de boas-vindas; DELETE = desativar) |
| GET/POST · GET/PUT/DELETE | /cursos · /cursos/:id | adm (DELETE 409 se tiver disciplinas) |
| GET/POST · GET/PUT/DELETE | /disciplinas · /disciplinas/:id | adm (DELETE 409 se tiver turmas) |
| GET/POST · PUT/DELETE | /turmas · /turmas/:id | adm (DELETE 409 se tiver matrículas/conteúdo) |
| GET | /turmas/:id | membro, adm |
| GET/POST · DELETE | /turmas/:id/matriculas (POST `{ alunos: [ids] }`) · /matriculas/:id | adm |
| GET/POST · PUT/DELETE | /eventos-institucionais · /eventos-institucionais/:id | GET auth · resto adm |

## Turma do usuário
| Método | Rota | Acesso |
|---|---|---|
| GET | /minhas-turmas?semestre=2/2026 | auth (agrupado por curso; % de progresso para aluno) |
| GET | /turmas/:id/participantes | membro (prof recebe também o % de cada aluno) |

## Conteúdo — membro B
| Método | Rota | Acesso |
|---|---|---|
| GET | /turmas/:id/conteudo (árvore Tópico→Seção→Material + progresso do aluno) | membro |
| POST | /turmas/:id/topicos | prof |
| PUT/DELETE | /topicos/:id | prof (DELETE em cascata) |
| POST | /topicos/:id/secoes | prof |
| PUT/DELETE | /secoes/:id | prof (DELETE em cascata) |
| POST | /secoes/:id/materiais (multipart p/ arquivo; JSON p/ link/texto) | prof |
| GET/PUT/DELETE | /materiais/:id | GET membro · PUT/DELETE prof |
| GET | /materiais/:id/download | membro |
| PUT/DELETE | /materiais/:id/progresso | mat |
| PATCH | /turmas/:id/conteudo/ordem | prof (reordenar) |

## Calendário — membro B
| Método | Rota | Acesso |
|---|---|---|
| GET | /eventos?de=&ate=&turma= | auth (eventos das turmas do usuário + institucionais) |
| GET/POST | /turmas/:id/eventos | GET membro · POST prof |
| PUT/DELETE | /eventos/:id | prof |

## Plano de Ensino — membro B
| GET/PUT | /turmas/:id/plano | GET membro · PUT prof (upsert) |
|---|---|---|

## Notas — membro A
| Método | Rota | Acesso |
|---|---|---|
| GET/POST | /turmas/:id/avaliacoes | prof |
| PUT/DELETE | /avaliacoes/:id | prof |
| PUT | /avaliacoes/:id/notas (lote `[{aluno, valor}]`) | prof |
| GET | /turmas/:id/notas | prof: tabela da turma · mat: só as próprias + média + situação |

## Notificações — membro A
| GET | /notificacoes · PATCH /notificacoes/:id/lida · PATCH /notificacoes/lidas · DELETE /notificacoes/:id | auth (só as próprias) |
|---|---|---|

## Assistente IA — membro B
| Método | Rota | Acesso |
|---|---|---|
| GET/POST | /turmas/:id/conversas | membro (só as próprias) |
| GET/DELETE | /conversas/:id | dono |
| POST | /conversas/:id/mensagens `{ texto }` → resposta da IA | dono (429 após 30/dia) |

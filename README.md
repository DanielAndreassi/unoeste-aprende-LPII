# Aprender Unoeste — clone (LP II)

Dupla: **Daniel Andreassi Lopes** e **Henrique Corazza**.

## Como rodar
1. `cp backend/.env.example backend/.env` e preencha ao menos `JWT_SECRET` (variáveis em [ADR-0015](docs/adr/0015-seguranca.md)).
2. `docker compose up` — Mongo, API em http://localhost:3000/api e front em http://localhost:5173.
3. Em outro terminal: `docker compose exec backend npm run seed` (**apaga e recria** o banco).

Testes unitários: `cd backend && npm test`.

## Credenciais de demonstração
Senha de todos: `Senha123`

| E-mail | Perfil |
|---|---|
| admin@aprender.local | Admin |
| prof1@aprender.local | Professor |
| aluno1@aprender.local, aluno2@aprender.local | Aluno |

Regras do projeto: [AGENTS.md](AGENTS.md).

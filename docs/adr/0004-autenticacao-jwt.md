# ADR-0004: Autenticação JWT + redefinição de senha por e-mail

- Status: Aceita
- Data: 2026-11-05

## Contexto
O enunciado exige login e redefinição de senha. A API deve ser RESTful (sem estado no servidor).

## Decisão
- Senhas com hash bcrypt.
- Login devolve um JWT (`{ id, role }`, expiração curta). O front envia `Authorization: Bearer <token>`.
- Middleware `auth` valida o token; middleware `authorize(...roles)` checa o papel (ver ADR-0002).
- Redefinição: `POST /auth/forgot-password` gera um token aleatório. O banco guarda só o **hash** do token, com validade (~30 min), e o link vai por e-mail via Nodemailer (SMTP em `.env`). `POST /auth/reset-password` valida o token, troca a senha e invalida o token.
- O `forgot-password` responde igual exista ou não o e-mail (não revela usuários).

## Consequências
- Token guardado no front (localStorage/Pinia); logout = descartar o token.
- Precisa de conta SMTP (Gmail com senha de app ou Mailtrap) configurada para a demo.

# ADR-0015: Segurança

- Status: Aceita
- Data: 2026-11-05

## Decisão
- JWT `{id, role}`, `JWT_EXPIRES_IN=8h`, sem refresh token. O middleware `auth` busca o usuário a cada requisição e recusa `ativo:false`.
- Senha: mínimo de 8 caracteres, pelo menos uma letra e um número; bcrypt com custo 10 (pacote `bcryptjs`: mesmo algoritmo, sem build nativo entre macOS e o container Linux).
- `helmet()`; CORS restrito a `FRONTEND_URL`.
- `express-rate-limit`: 10 tentativas por 15 min por IP em `/auth/login` e `/auth/forgot-password`.
- Arquivos de material: ≤ 20 MB, apenas `pdf, zip, doc(x), ppt(x), xls(x), txt, png, jpg`. Avatar: ≤ 2 MB, jpg/png/webp.
- O servidor não sobe sem `JWT_SECRET`.
- Markdown seguro: [ADR-0013](0013-markdown-seguro.md).

## Variáveis de ambiente
Backend: `PORT, MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN, FRONTEND_URL, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, GEMINI_API_KEY, GEMINI_MODEL`
Front: `VITE_API_URL`

## E-mail
Gmail com senha de app na apresentação; sem SMTP configurado, usa Ethereal do Nodemailer (link de pré-visualização no console).

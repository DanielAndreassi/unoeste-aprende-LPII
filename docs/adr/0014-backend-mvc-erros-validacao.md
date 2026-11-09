# ADR-0014: Backend — MVC estrito, erros e validação

- Status: Aceita
- Data: 2026-11-05

## Decisão
- **MVC estrito, sem camada `services/`**: `routes → middlewares → controllers → models`. A lógica compartilhada fica assim:
  - **Models** (métodos/statics/hooks do Mongoose): `Usuario.verificarSenha()`, `Usuario.gerarTokenReset()`, `Turma.vinculoDe(usuario)`, `Notificacao.notificarTurma()`, `Nota.boletim()`, cascata em `pre('deleteOne')` de Tópico, Seção e Material.
  - **`utils/`**: funções puras e testáveis (`calcularMedia`, `semestreAtual`, `percentual`, `validarSenha`).
  - **`config/`**: clientes externos já configurados (`db.js`, `mailer.js`, `gemini.js`), chamados direto pelo controller.
- **Validação** pelos validadores do schema Mongoose (`required`, `min`, `max`, `enum`, `match`). Sem `express-validator`.
- **Erros**: controllers lançam `createError(status, msg)` do pacote `http-errors` (o mesmo que o Express usa internamente) sem try/catch — o Express 5 repassa promises rejeitadas ao handler de erro. Um `errorHandler` único no fim do `app.js` (delega ao padrão do Express se `res.headersSent`) traduz:
  - erro do JWT (inválido/expirado) → 401
  - `ValidationError` → 400 com `{ erro, campos: {campo: msg} }`
  - código 11000 (chave duplicada) → 409
  - `CastError` → 400; `MulterError` e JSON malformado → 400
  - `http-errors` com `expose` (os nossos 4xx) → status/mensagem
  - qualquer outro → 500 genérico (sem stack para o cliente; registrado no console)
- **Middlewares** (recursos nativos do Express Router):
  - `router.use(auth)` no roteador da API, depois das rotas públicas — não se repete `auth` por rota.
  - `router.param('<x>Id', carregar(Model))` carrega o documento do parâmetro em `req.<model>` (uma vez por requisição, 404 se não existe) e, se ele tem `turma`, também `req.turma`.
  - `exigirVinculo('prof' | 'mat' | 'adm', ...)` usa `req.turma.vinculoDe(req.usuario)`, preenche `req.vinculo` ou devolve 403. Mesmo padrão de `authorize(...roles)`.
  - Rotas com o mesmo caminho agrupadas com `router.route()`.
- **Vínculo com a turma**: Tópico, Seção, Material, Avaliação, Evento e Conversa guardam o campo `turma`, para o `carregar` achar a turma sem subir a árvore.
- **Datas**: `Date` em UTC no banco; exibição em `America/Sao_Paulo` via `Intl`, sem biblioteca de datas.
- **Paginação**: só em `GET /usuarios` (`?page=&q=`, 20 por página).

## Consequências
- Formato de erro único, consumido pelo interceptor do Axios.
- O campo `turma` duplicado é imutável depois da criação.

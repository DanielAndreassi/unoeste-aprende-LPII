# ADR-0014: Backend — MVC estrito, erros e validação

- Status: Aceita
- Data: 2026-11-05

## Decisão
- **MVC estrito, sem camada `services/`**: `routes → middlewares → controllers → models`. A lógica compartilhada fica assim:
  - **Models** (métodos/statics/hooks do Mongoose): `Usuario.verificarSenha()`, `Usuario.gerarTokenReset()`, `Notificacao.notificarTurma()`, `Nota.boletim()`, cascata em `pre('deleteOne')` de Tópico e Seção.
  - **`utils/`**: funções puras e testáveis (`calcularMedia`, `semestreAtual`, `percentual`, `validarSenha`), mais a classe `HttpError`.
  - **`config/`**: clientes externos já configurados (`db.js`, `mailer.js`, `gemini.js`), chamados direto pelo controller.
- **Validação** pelos validadores do schema Mongoose (`required`, `min`, `max`, `enum`, `match`). Sem `express-validator`.
- **Erros**: controllers lançam `new HttpError(status, msg)` sem try/catch (o Express 5 repassa erros async). Um `errorHandler` único no fim do `app.js` traduz:
  - `HttpError` → status/mensagem
  - `ValidationError` → 400 com `{ erro, campos: {campo: msg} }`
  - código 11000 (chave duplicada) → 409
  - `CastError` → 400
  - qualquer outro → 500 genérico (sem stack para o cliente; registrado no console)
- **Vínculo com a turma**: Tópico, Seção, Material, Avaliação e Evento guardam o campo `turma`. O middleware `vinculoTurma` preenche `req.vinculo = 'prof' | 'mat'` ou devolve 403.
- **Datas**: `Date` em UTC no banco; exibição em `America/Sao_Paulo` via `Intl`, sem biblioteca de datas.
- **Paginação**: só em `GET /usuarios` (`?page=&q=`, 20 por página).

## Consequências
- Formato de erro único, consumido pelo interceptor do Axios.
- O campo `turma` duplicado é imutável depois da criação.

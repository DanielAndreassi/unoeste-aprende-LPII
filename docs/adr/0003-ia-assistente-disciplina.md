# ADR-0003: IA — Assistente da disciplina

- Status: Aceita
- Data: 2026-11-05
- Provedor: **Google Gemini** (free tier), SDK oficial `@google/genai`, chave `GEMINI_API_KEY` em `.env`

## Contexto
O enunciado exige um mecanismo de IA. O original só tem um botão flutuante que leva ao ChatGPT externo.

## Decisão
Chat dentro da disciplina, para **membros da turma (aluno e professor)**, que responde dúvidas usando como contexto: o plano de ensino, a árvore de tópicos/seções/materiais (títulos e descrições), o conteúdo dos materiais do tipo `texto` e os eventos da turma. O conteúdo de PDFs fica fora do MVP ([ADR-0011](0011-fora-do-escopo.md)). O backend monta o prompt e chama o LLM; a chave nunca vai para o front.

- Histórico **salvo no Mongo** (coleção `Conversa` com mensagens embutidas). O aluno lista, abre e exclui as próprias conversas.
- A cada pergunta, o backend envia contexto da turma + últimas N mensagens da conversa + pergunta.
- Instrução de sistema: responder só sobre a disciplina, em português, e dizer quando não souber.

- Modelo: `GEMINI_MODEL`, com padrão no Flash mais recente do free tier; o nome exato é confirmado na implementação.

## Consequências
- Rotas `/turmas/:id/conversas` e `/conversas/:id/mensagens` (ver [api.md](../api.md)), protegidas por vínculo com a turma e por dono.
- Precisa de `GEMINI_API_KEY`; se a chamada falhar, mostrar erro amigável sem perder a pergunta.

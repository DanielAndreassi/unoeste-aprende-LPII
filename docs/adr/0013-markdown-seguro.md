# ADR-0013: Renderização segura de Markdown

- Status: Aceita
- Data: 2026-11-05

## Contexto
O professor escreve Markdown (material `texto` e Plano de Ensino) e o aluno vê o HTML resultante. Se esse HTML não for tratado, abre brecha de XSS: o JWT fica no localStorage e poderia ser roubado.

## Decisão
- `markdown-it` com `html: false` (ignora HTML cru), renderizado no front num único componente `MarkdownView`.
- Proibido `v-html` com conteúdo de usuário fora desse componente.

## Consequências
- Uma única dependência; o professor não consegue embutir HTML ou iframes.

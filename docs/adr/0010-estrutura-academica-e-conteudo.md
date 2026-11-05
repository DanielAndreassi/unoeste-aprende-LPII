# ADR-0010: Estrutura acadêmica e conteúdo em 3 níveis

- Status: Aceita
- Data: 2026-11-05

## Contexto
O original mostra "ESTÁGIO SUPERVISIONADO I - 7A (2/2026)", ou seja, a disciplina do catálogo e a oferta no semestre aparecem juntas. Na página da disciplina, o bloco recolhível "ALUNOS" (que também aparece no menu lateral) contém subtítulos, e cada subtítulo contém materiais (zip, doc, PDF, página web, link e um "prompt" em texto).

## Decisão
- **Curso → Disciplina (catálogo) → Turma (oferta: código + semestre + professores) → Matrícula**.
- Conteúdo em 3 níveis: **Tópico** (recolhível, listado no menu lateral) → **Seção** (subtítulo) → **Material**. Todos têm `ordem`.
- Material tem tipo `arquivo` | `link` | `texto` (Markdown escrito pelo professor). O ícone é escolhido pela extensão ou pelo tipo.
- A home agrupa as turmas por curso. Não existe a "Sala do Coordenador".

## Consequências
- Mais um CRUD de admin (Disciplina).
- O front monta o menu lateral a partir dos tópicos da turma.
- Renderizar Markdown exige sanitização (ver a decisão na rodada 2 da entrevista).

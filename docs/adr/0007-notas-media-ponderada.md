# ADR-0007: Notas — avaliações com peso e média automática

- Status: Aceita
- Data: 2026-11-05

## Contexto
O original tem um módulo "Notas". Queremos mais do que uma lista de valores, sem chegar ao regime completo de bimestres e exame.

## Decisão
- O professor faz CRUD de **Avaliação** por turma: `nome`, `peso`, `data`.
- O professor lança uma **Nota** (0–10) por aluno e avaliação.
- A média é calculada ao ler (não é guardada): `Σ(nota·peso) / Σ(peso das avaliações com nota lançada)`.
- Situação: `Aprovado` com média ≥ 6 e todas as avaliações lançadas; `Reprovado` com média < 6 e todas lançadas; caso contrário `Em andamento`.
- O aluno vê só as próprias notas; o professor vê a tabela da turma.

## Consequências
- A média nunca fica dessincronizada, porque não é persistida.
- O corte 6,0 é constante única no backend.

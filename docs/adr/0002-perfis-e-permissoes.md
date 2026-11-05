# ADR-0002: Perfis e permissões

- Status: Aceita
- Data: 2026-11-05

## Contexto
O original exibe "seu perfil é Aluno" na disciplina; existem professores e coordenação. O enunciado penaliza poucos recursos CRUD.

## Decisão
Três perfis globais, **exatamente um por usuário**:
- **Admin**: CRUD de usuários, cursos, disciplinas, turmas e matrículas.
- **Professor**: nas turmas em que leciona, CRUD de tópicos, seções, materiais, eventos, avaliações/notas e plano de ensino; usa o assistente de IA.
- **Aluno**: nas turmas em que está matriculado, lê conteúdo, marca progresso, vê as próprias notas e usa o assistente de IA.

Contas e exclusões: [ADR-0012](0012-contas-e-exclusoes.md).

Autorização por middleware: perfil (role) + vínculo com a turma.

## Consequências
- Mais telas (painel admin, edição para professor) e mais CRUDs reais.
- Todo endpoint de turma precisa validar matrícula/docência, não só o login.

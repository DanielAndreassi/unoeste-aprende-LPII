# Modelo de dados

| Coleção | Campos principais | Quem faz CRUD |
|---|---|---|
| Usuario | nome, email (único), senhaHash, role (admin/professor/aluno — **um só**), avatar, ativo, resetTokenHash, resetTokenExp | Admin (desativa, nunca apaga) |
| Curso | nome, sigla (ex.: BACH-PRES-PP) | Admin |
| Disciplina | nome, curso→Curso, cargaHoraria | Admin |
| Turma | disciplina→Disciplina, codigo (7A), semestre (2/2026), professores→[Usuario] | Admin |
| Matricula | aluno→Usuario, turma→Turma (par único) | Admin |
| Topico | turma, titulo (ex.: "ALUNOS"), ordem | Professor |
| Secao | topico, titulo, ordem | Professor |
| Material | secao, titulo, descricao?, tipo (arquivo/link/texto), url \| arquivo{nome, mime, tamanho, caminho} \| conteudo (Markdown), ordem | Professor |
| Progresso | aluno, material (par único), concluidoEm | Aluno (marca/desmarca) |
| Evento | turma (null = institucional), titulo, tipo (aula-ao-vivo/atividade/prova/outro), link?, inicio, fim | Professor (turma) · Admin (institucional) |
| PlanoEnsino | turma (1:1), ementa, objetivos, conteudoProgramatico, avaliacao, bibliografia | Professor |
| Avaliacao | turma, nome, peso, data | Professor |
| Nota | avaliacao, aluno (par único), valor 0–10 | Professor |
| Notificacao | usuario, tipo, mensagem, link, lida | Sistema cria; o usuário marca como lida ou exclui |
| Conversa | usuario (aluno ou professor da turma), turma, titulo, mensagens:[{autor (usuario/ia), texto, criadaEm}] | Dono |

Regras de comportamento: [regras-negocio.md](regras-negocio.md)

Rótulo exibido de uma turma: `<Disciplina.nome> - <codigo> (<semestre>)`.

## Exclusões ([ADR-0012](adr/0012-contas-e-exclusoes.md))
- Usuario → `ativo:false` (login bloqueado).
- Curso / Disciplina / Turma → **409** se tiver dependentes.
- Topico → cascata para Seções → Materiais → Progresso + arquivos em disco. Seção → cascata para Materiais.

Regras: [ADR-0002](adr/0002-perfis-e-permissoes.md) (acesso), [ADR-0007](adr/0007-notas-media-ponderada.md) (média), [ADR-0003](adr/0003-ia-assistente-disciplina.md) (IA), [ADR-0010](adr/0010-estrutura-academica-e-conteudo.md) (estrutura).
Contrato da API: [api.md](api.md)

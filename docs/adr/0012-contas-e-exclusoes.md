# ADR-0012: Criação de contas e regras de exclusão

- Status: Aceita
- Data: 2026-11-05

## Decisão
- **Sem autocadastro.** O admin cria o usuário sem senha e o sistema envia um e-mail de boas-vindas com link para definir a senha, reaproveitando o token e a tela de reset ([ADR-0004](0004-autenticacao-jwt.md)).
- **Um papel por usuário**; um professor nunca é aluno.
- **Usuário**: não é apagado, é desativado (`ativo:false`), e o login é recusado.
- **Curso / Disciplina / Turma**: o DELETE devolve **409** quando há dependentes.
- **Tópico / Seção**: o DELETE é em cascata (materiais, progresso e arquivos em disco), com confirmação na interface.

## Consequências
- O histórico de notas e de matrículas nunca fica órfão.
- A cascata fica num único lugar (service/model), e não espalhada pelos controllers.

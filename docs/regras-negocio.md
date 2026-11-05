# Regras de negócio por módulo

## Conteúdo
- Material tem `descricao` opcional, exibida abaixo do título e enviada para a IA.
- Sem rascunho/oculto: tudo o que é criado já fica visível.
- Material `texto` e Plano de Ensino são renderizados com `markdown-it` (`html:false`) → [ADR-0013](adr/0013-markdown-seguro.md)

## Progresso
- `% turma = concluídos ÷ total de materiais` (todos os tipos).
- Check **manual** pelo aluno; abrir ou baixar não marca.
- O professor vê o % de cada aluno na página Participantes.

## Semestre
- String `"1/2026"` / `"2/2026"`. Atual: janeiro a junho = 1, julho a dezembro = 2.
- O seletor da home lista só os semestres em que o usuário tem turmas; o padrão é o atual. Sem coleção `Semestre`.

## Eventos / Calendário
| Tipo | Cor | Extra |
|---|---|---|
| aula-ao-vivo | laranja | `link` da reunião |
| atividade | roxo | |
| prova | vermelho | |
| outro | cinza | |
- Todo evento tem `inicio` e `fim` (pode durar vários dias). No mês: marca verde no dia de início e vermelha no dia de fim.
- **Eventos institucionais**: `turma: null`, CRUD do admin, visíveis para todos.
- Home: mês + "eventos de hoje até +7 dias". Calendário completo: mês com todas as turmas e filtro por turma. Disciplina: só os eventos dela.

## Notificações
- Recebe só o **aluno**: novo material, novo evento e nota lançada ou alterada, das turmas em que está matriculado.
- Não há e-mail para notificações. O front consulta o servidor (polling) a cada 60 s.

## Perfil
- Avatar: multer, ≤ 2 MB, jpg/png/webp, servido publicamente em `/uploads/avatars` (única pasta pública). Sem foto, mostra as iniciais.

## Assistente IA
- 30 mensagens por usuário por dia → depois disso, 429 com mensagem amigável.
- Cada pergunta envia as últimas 10 mensagens da conversa.
- Título da conversa = primeira pergunta cortada em 60 caracteres.

## Plano de Ensino
- Cinco campos fixos em Markdown: ementa, objetivos, conteúdo programático, avaliação, bibliografia.

## Admin
- Matrícula em lote: `POST /turmas/:id/matriculas { alunos: [ids] }`, com busca na interface.
- Os professores da turma são escolhidos no próprio formulário da turma.

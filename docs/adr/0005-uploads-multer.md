# ADR-0005: Upload de materiais com multer (disco local)

- Status: Aceita
- Data: 2026-11-05

## Contexto
Materiais da disciplina são PDFs, zips, documentos e links (ver tela de Conteúdo do original).

## Decisão
- Material tem `tipo`: `arquivo` | `link`.
- Arquivos são enviados via multer para `backend/uploads/` com nome gerado. O Mongo guarda os metadados (nome original, mimetype, tamanho, caminho).
- Download por rota autenticada que checa o vínculo com a turma (não servir `uploads/` como estático público).
- Limite de tamanho e lista de tipos permitidos no multer.

## Consequências
- `uploads/` fica no `.gitignore`; o ZIP de entrega deve conter o seed com arquivos de exemplo, se precisar.
- Ao excluir um material do tipo arquivo, o arquivo em disco também é removido.

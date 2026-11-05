# ADR-0008: MongoDB local/Docker + seed de demonstração

- Status: Aceita
- Data: 2026-11-05

## Contexto
A dupla desenvolve em máquinas separadas e precisa de dados realistas na apresentação.

## Decisão
- **Tudo em Docker**: um único `docker-compose.yml` na raiz, voltado ao desenvolvimento e usado também na apresentação (sem build de produção/nginx):
  - `mongo` com volume nomeado `mongo-data`;
  - `backend` com `node --watch`, código montado e volume nomeado para `uploads/`;
  - `frontend` com `vite dev --host` e código montado;
  - `node_modules` em volume anônimo por container (não mistura binários do macOS com os do Linux).
- Seed **manual**: `docker compose exec backend npm run seed` (sem seed automático). Ele apaga e recria: 1 admin, professores, alunos, o curso de Sistemas de Informação e as disciplinas do 7º termo, com tópicos, seções, materiais, eventos (incluindo institucionais), avaliações, notas e plano de ensino.
- **Pessoas fictícias, disciplinas e curso reais.**
- Credenciais: `admin@aprender.local`, `prof1@aprender.local`, `aluno1@aprender.local`…, todas com a senha `Senha123`; impressas no console e repetidas no README.

## Consequências
- Cada membro tem banco próprio; o seed é a fonte comum de dados.
- O seed precisa acompanhar toda mudança de model.

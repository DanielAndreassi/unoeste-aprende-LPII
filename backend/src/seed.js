// Seed de demonstração (ADR-0008): APAGA o banco e recria. Rodar: docker compose exec backend npm run seed
// Pessoas fictícias; curso e disciplinas reais. Deve acompanhar toda mudança de model.
import fs from 'node:fs/promises';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Usuario from './models/Usuario.js';
import Curso from './models/Curso.js';
import Disciplina from './models/Disciplina.js';
import Turma from './models/Turma.js';
import Matricula from './models/Matricula.js';
import Topico from './models/Topico.js';
import Secao from './models/Secao.js';
import Material from './models/Material.js';
import { MATERIAIS_DIR } from './config/uploads.js';
import { semestreAtual } from './utils/semestre.js';

const SENHA = 'Senha123';

async function criarUsuario(nome, email, role) {
  const u = new Usuario({ nome, email, role });
  await u.definirSenha(SENHA);
  return u.save();
}

await connectDB();
await mongoose.connection.dropDatabase();
await mongoose.connection.syncIndexes();

await criarUsuario('Administrador', 'admin@aprender.local', 'admin');
const prof1 = await criarUsuario('Marina Couto', 'prof1@aprender.local', 'professor');
const aluno1 = await criarUsuario('Lucas Ferraz', 'aluno1@aprender.local', 'aluno');
const aluno2 = await criarUsuario('Beatriz Nogueira', 'aluno2@aprender.local', 'aluno');

const si = await Curso.create({ nome: 'Sistemas de Informação', sigla: 'BACH-PRES-PP' });
const estagio = await Disciplina.create({
  nome: 'Estágio Supervisionado I',
  curso: si,
  cargaHoraria: 80,
});
const turma = await Turma.create({
  disciplina: estagio,
  codigo: '7A',
  semestre: semestreAtual(),
  professores: [prof1],
});
await Matricula.insertMany([aluno1, aluno2].map((aluno) => ({ aluno, turma })));

// Conteúdo de exemplo: Tópico → Seção → Material (arquivo, link e texto)
const topico = await Topico.create({ turma, titulo: 'ALUNOS', ordem: 0 });
const secao = await Secao.create({ topico, turma, titulo: 'Documentos do estágio', ordem: 0 });
await fs.mkdir(MATERIAIS_DIR, { recursive: true });
await fs.writeFile(
  `${MATERIAIS_DIR}/seed-roteiro.txt`,
  'Roteiro de exemplo do estágio (arquivo do seed).\n',
);
await Material.create([
  {
    secao,
    turma,
    titulo: 'Roteiro do estágio',
    descricao: 'Leia antes da primeira reunião.',
    tipo: 'arquivo',
    arquivo: {
      nome: 'roteiro-estagio.txt',
      mime: 'text/plain',
      tamanho: 49,
      caminho: 'materiais/seed-roteiro.txt',
    },
    ordem: 0,
  },
  {
    secao,
    turma,
    titulo: 'Portal da Unoeste',
    tipo: 'link',
    url: 'https://www.unoeste.br',
    ordem: 1,
  },
  {
    secao,
    turma,
    titulo: 'Como entregar o relatório',
    tipo: 'texto',
    conteudo: '## Passos\n\n1. Escreva o relatório\n2. Revise com o orientador\n3. Entregue em PDF',
    ordem: 2,
  },
]);

console.log(`\nSeed concluído. Senha de todos: ${SENHA}`);
console.table((await Usuario.find().lean()).map(({ email, role }) => ({ email, role })));
await mongoose.disconnect();

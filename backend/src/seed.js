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
import Avaliacao from './models/Avaliacao.js';
import Nota from './models/Nota.js';
import PlanoEnsino from './models/PlanoEnsino.js';
import Notificacao from './models/Notificacao.js';
import Evento from './models/Evento.js';
import Progresso from './models/Progresso.js';
import Conversa from './models/Conversa.js';
import { MATERIAIS_DIR } from './config/uploads.js';
import { semestreAtual } from './utils/semestre.js';

const SENHA = 'Senha123';
const DIA = 864e5;

async function criarUsuario(nome, email, role) {
  const u = new Usuario({ nome, email, role });
  await u.definirSenha(SENHA);
  return u.save();
}

// Data daqui a `dias` dias, na hora cheia indicada
function em(dias, hora = 19) {
  const d = new Date(Date.now() + dias * DIA);
  d.setHours(hora, 0, 0, 0);
  return d;
}

await connectDB();
await mongoose.connection.dropDatabase();
await mongoose.connection.syncIndexes();

await criarUsuario('Administrador', 'admin@aprender.local', 'admin');
const profs = [];
for (const [i, nome] of ['Marina Couto', 'Rogério Tavares', 'Helena Prado'].entries())
  profs.push(await criarUsuario(nome, `prof${i + 1}@aprender.local`, 'professor'));
const alunos = [];
const nomes = [
  'Lucas Ferraz',
  'Beatriz Nogueira',
  'Caio Martins',
  'Larissa Duarte',
  'Pedro Sampaio',
  'Fernanda Leite',
  'Gustavo Rocha',
  'Isabela Moraes',
];
for (const [i, nome] of nomes.entries())
  alunos.push(await criarUsuario(nome, `aluno${i + 1}@aprender.local`, 'aluno'));

const si = await Curso.create({ nome: 'Sistemas de Informação', sigla: 'BACH-PRES-PP' });

// Disciplinas do 7º termo (nomes a conferir com a grade real); `alunos` = índices matriculados
const DISCIPLINAS = [
  { nome: 'Estágio Supervisionado I', carga: 80, prof: 0, alunos: [0, 1, 2, 3, 4, 5, 6, 7] },
  { nome: 'Linguagem de Programação II', carga: 80, prof: 0, alunos: [0, 1, 2, 3, 4, 5] },
  { nome: 'Inteligência Artificial', carga: 60, prof: 1, alunos: [0, 1, 2, 3, 6, 7] },
  { nome: 'Segurança da Informação', carga: 60, prof: 2, alunos: [0, 1, 4, 5, 6, 7] },
];

await fs.mkdir(MATERIAIS_DIR, { recursive: true });
await fs.writeFile(
  `${MATERIAIS_DIR}/seed-roteiro.txt`,
  'Roteiro de exemplo da disciplina (arquivo do seed).\n',
);

const turmas = [];
for (const [t, d] of DISCIPLINAS.entries()) {
  const disciplina = await Disciplina.create({ nome: d.nome, curso: si, cargaHoraria: d.carga });
  const turma = await Turma.create({
    disciplina,
    codigo: '7A',
    semestre: semestreAtual(),
    professores: [profs[d.prof]],
  });
  turmas.push(turma);
  const mats = d.alunos.map((i) => alunos[i]);
  await Matricula.insertMany(mats.map((aluno) => ({ aluno, turma })));

  // Conteúdo: 2 tópicos, cada um com 1 seção de 3 materiais (arquivo, link e texto)
  const materiais = [];
  for (const [o, titulo] of ['ALUNOS', 'AULAS'].entries()) {
    const topico = await Topico.create({ turma, titulo, ordem: o });
    const secao = await Secao.create({
      topico,
      turma,
      titulo: o ? 'Slides e leituras' : 'Documentos da disciplina',
      ordem: 0,
    });
    materiais.push(
      ...(await Material.create([
        {
          secao,
          turma,
          titulo: o ? 'Slides da semana' : 'Roteiro da disciplina',
          descricao: 'Leia antes da próxima aula.',
          tipo: 'arquivo',
          arquivo: {
            nome: 'roteiro.txt',
            mime: 'text/plain',
            tamanho: 54,
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
          titulo: 'Orientações de entrega',
          tipo: 'texto',
          conteudo: `## Passos\n\n1. Estude o material de ${d.nome}\n2. Tire dúvidas no **Assistente IA**\n3. Entregue no prazo`,
          ordem: 2,
        },
      ])),
    );
  }

  // Progresso variado (0 a 100%): cada aluno conclui uma fatia diferente dos materiais
  await Progresso.insertMany(
    mats.flatMap((aluno, i) =>
      materiais
        .slice(0, Math.round((materiais.length * ((i * 2 + t) % 6)) / 5))
        .map((material) => ({ aluno, material, turma })),
    ),
  );

  // Notas variadas (aprovado, reprovado e em andamento): os 2 últimos ficam sem a nota do trabalho
  const [prova, trabalho] = await Avaliacao.create([
    { turma, nome: 'Prova 1', peso: 3, data: new Date(Date.now() - 7 * DIA) },
    { turma, nome: 'Trabalho final', peso: 2, data: new Date(Date.now() + 14 * DIA) },
  ]);
  const valores = [8, 6.5, 4, 9.5, 5.5, 7, 3, 10];
  await Nota.create(
    mats.flatMap((aluno, i) => [
      { avaliacao: prova, aluno, valor: valores[(i + t) % 8] },
      ...(i < mats.length - 2
        ? [{ avaliacao: trabalho, aluno, valor: valores[(i * 3 + t) % 8] }]
        : []),
    ]),
  );

  await PlanoEnsino.create({
    turma,
    ementa: `Estudo dos fundamentos e práticas de ${d.nome}, aplicados ao curso de Sistemas de Informação.`,
    objetivos: '- Compreender os conceitos centrais\n- Aplicar os conceitos em projetos reais',
    conteudoProgramatico: '1. Introdução\n2. Fundamentos\n3. Estudos de caso\n4. Projeto final',
    avaliacao: 'Prova 1 (peso 3) e trabalho final (peso 2). Aprovação com média 6,0.',
    bibliografia: '- Bibliografia básica da disciplina (biblioteca Unoeste)',
  });

  // Eventos dos 4 tipos, passados e futuros (vários dentro dos próximos 7 dias)
  await Evento.create([
    {
      turma,
      titulo: 'Aula ao vivo: revisão',
      tipo: 'aula-ao-vivo',
      link: 'https://meet.google.com/aaa-bbbb-ccc',
      inicio: em(t + 1, 19),
      fim: em(t + 1, 21),
    },
    {
      turma,
      titulo: 'Atividade em grupo',
      tipo: 'atividade',
      inicio: em(2 + t, 8),
      fim: em(6 + t, 23),
    },
    { turma, titulo: 'Prova 1', tipo: 'prova', inicio: em(-7, 19), fim: em(-7, 21) },
    { turma, titulo: 'Prova final', tipo: 'prova', inicio: em(20 + t, 19), fim: em(20 + t, 21) },
    {
      turma,
      titulo: 'Plantão de dúvidas',
      tipo: 'outro',
      inicio: em(10 + t, 18),
      fim: em(10 + t, 19),
    },
  ]);
}

// Eventos institucionais (turma: null), visíveis para todos
await Evento.create([
  { titulo: 'Semana Acadêmica', tipo: 'outro', inicio: em(4, 8), fim: em(8, 22) },
  { titulo: 'Recesso institucional', tipo: 'outro', inicio: em(12, 0), fim: em(12, 23) },
]);

// Notificações e conversa de exemplo do aluno1 (as reais nascem nos controllers)
const [estagio] = turmas;
await Notificacao.create([
  {
    usuario: alunos[0],
    tipo: 'nota',
    mensagem: 'Nota lançada: Prova 1',
    link: `/turmas/${estagio._id}/notas`,
  },
  {
    usuario: alunos[0],
    tipo: 'evento',
    mensagem: 'Novo evento: Aula ao vivo: revisão',
    link: `/turmas/${estagio._id}/calendario`,
  },
  {
    usuario: alunos[0],
    tipo: 'material',
    mensagem: 'Novo material no conteúdo da disciplina',
    link: `/turmas/${estagio._id}/conteudo`,
    lida: true,
  },
]);
await Conversa.create({
  usuario: alunos[0],
  turma: estagio,
  titulo: 'Como entregar o relatório?',
  mensagens: [
    { autor: 'usuario', texto: 'Como entregar o relatório?' },
    {
      autor: 'ia',
      texto: 'Escreva o relatório, revise com o orientador e entregue em PDF dentro do prazo.',
    },
  ],
});

console.log(`\nSeed concluído. Senha de todos: ${SENHA}`);
console.table((await Usuario.find().lean()).map(({ email, role }) => ({ email, role })));
await mongoose.disconnect();

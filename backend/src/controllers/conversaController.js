import createError from 'http-errors';
import Conversa from '../models/Conversa.js';
import Topico from '../models/Topico.js';
import Secao from '../models/Secao.js';
import Material from '../models/Material.js';
import Evento from '../models/Evento.js';
import PlanoEnsino from '../models/PlanoEnsino.js';
import '../models/Disciplina.js'; // registra o schema usado no populate
import { perguntar } from '../config/gemini.js';
import { inicioDoDia, montarContexto } from '../utils/contexto.js';

const LIMITE_DIARIO = 30;
const HISTORICO = 10;
const MAX_PERGUNTA = 2000;

const SISTEMA = `Você é o assistente de uma disciplina universitária. Responda apenas sobre a disciplina, em português do Brasil, usando o contexto abaixo. Se a resposta não estiver no contexto ou o assunto fugir da disciplina, diga que não sabe ou que não pode ajudar com isso. Use Markdown simples.\n\n`;

// Conversa é privada: quem não é o dono recebe 404 (não revela que existe).
export function doDono(req, _res, next) {
  if (!req.conversa.usuario.equals(req.usuario._id))
    throw createError(404, 'Registro não encontrado');
  next();
}

export async function listar(req, res) {
  res.json(
    await Conversa.find({ usuario: req.usuario._id, turma: req.turma._id })
      .select('titulo updatedAt')
      .sort('-updatedAt')
      .lean(),
  );
}

export async function criar(req, res) {
  res.status(201).json(await Conversa.create({ usuario: req.usuario._id, turma: req.turma._id }));
}

export const obter = (req, res) => res.json(req.conversa);

export async function excluir(req, res) {
  await req.conversa.deleteOne();
  res.status(204).end();
}

async function contextoDa(turma) {
  await turma.populate('disciplina', 'nome');
  const filtro = { turma: turma._id };
  const [plano, topicos, secoes, materiais, eventos] = await Promise.all([
    PlanoEnsino.findOne(filtro).lean(),
    Topico.find(filtro).sort('ordem _id').lean(),
    Secao.find(filtro).sort('ordem _id').lean(),
    Material.find(filtro).sort('ordem _id').lean(),
    Evento.find(filtro).sort('inicio').lean(),
  ]);
  const porSecao = Map.groupBy(materiais, (m) => String(m.secao));
  const porTopico = Map.groupBy(secoes, (s) => String(s.topico));
  return montarContexto({
    rotulo: `${turma.disciplina.nome} - ${turma.codigo} (${turma.semestre})`,
    plano,
    eventos,
    topicos: topicos.map((t) => ({
      ...t,
      secoes: (porTopico.get(String(t._id)) ?? []).map((s) => ({
        ...s,
        materiais: porSecao.get(String(s._id)) ?? [],
      })),
    })),
  });
}

export async function enviar(req, res) {
  const texto = typeof req.body?.texto === 'string' ? req.body.texto.trim() : '';
  if (!texto) throw createError(400, 'Escreva uma pergunta');
  if (texto.length > MAX_PERGUNTA)
    throw createError(400, `A pergunta pode ter até ${MAX_PERGUNTA} caracteres`);

  // 30 perguntas por usuário por dia, em todas as conversas
  const [{ n } = { n: 0 }] = await Conversa.aggregate([
    { $match: { usuario: req.usuario._id } },
    { $unwind: '$mensagens' },
    { $match: { 'mensagens.autor': 'usuario', 'mensagens.criadaEm': { $gte: inicioDoDia() } } },
    { $count: 'n' },
  ]);
  if (n >= LIMITE_DIARIO)
    throw createError(
      429,
      `Você chegou ao limite de ${LIMITE_DIARIO} perguntas por dia. Volte amanhã.`,
    );

  const { conversa } = req;
  const resposta = await perguntar({
    sistema: SISTEMA + (await contextoDa(req.turma)),
    mensagens: [...conversa.mensagens.slice(-HISTORICO), { autor: 'usuario', texto }],
  });

  // Só grava depois da resposta: se a IA falhar nada fica pela metade e o front mantém o texto digitado.
  if (!conversa.mensagens.length) conversa.titulo = texto.slice(0, 60);
  conversa.mensagens.push({ autor: 'usuario', texto }, { autor: 'ia', texto: resposta });
  res.json(await conversa.save());
}

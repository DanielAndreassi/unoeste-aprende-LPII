import path from 'node:path';
import { rm } from 'node:fs/promises';
import createError from 'http-errors';
import Topico from '../models/Topico.js';
import Secao from '../models/Secao.js';
import Material from '../models/Material.js';
import Progresso from '../models/Progresso.js';
import { UPLOADS_DIR } from '../config/uploads.js';

// Novo item entra no fim da lista dos irmãos.
async function proximaOrdem(Model, filtro) {
  const ultimo = await Model.findOne(filtro).sort('-ordem');
  return ultimo ? ultimo.ordem + 1 : 0;
}

// O caminho em disco nunca sai da API.
function visao(material) {
  const m = material.toObject ? material.toObject() : { ...material };
  if (m.arquivo) delete m.arquivo.caminho;
  return m;
}

// --- árvore ---

export async function arvore(req, res) {
  const turma = req.turma._id;
  const [topicos, secoes, materiais] = await Promise.all([
    Topico.find({ turma }).sort('ordem _id').lean(),
    Secao.find({ turma }).sort('ordem _id').lean(),
    Material.find({ turma }).sort('ordem _id').lean(),
  ]);
  const concluidos =
    req.vinculo === 'mat'
      ? new Set(
          (await Progresso.find({ aluno: req.usuario._id, turma }).lean()).map((p) =>
            String(p.material),
          ),
        )
      : null;

  const porSecao = Map.groupBy(materiais, (m) => String(m.secao));
  const porTopico = Map.groupBy(secoes, (s) => String(s.topico));
  res.json(
    topicos.map((t) => ({
      ...t,
      secoes: (porTopico.get(String(t._id)) ?? []).map((s) => ({
        ...s,
        materiais: (porSecao.get(String(s._id)) ?? []).map((m) => ({
          ...visao(m),
          ...(concluidos && { concluido: concluidos.has(String(m._id)) }),
        })),
      })),
    })),
  );
}

// --- tópicos ---

export async function criarTopico(req, res) {
  const topico = await Topico.create({
    turma: req.turma._id,
    titulo: req.body.titulo,
    ordem: await proximaOrdem(Topico, { turma: req.turma._id }),
  });
  res.status(201).json(topico);
}

export async function atualizarTopico(req, res) {
  req.topico.titulo = req.body.titulo;
  res.json(await req.topico.save());
}

export async function excluirTopico(req, res) {
  await req.topico.deleteOne(); // cascata no model (ADR-0012)
  res.status(204).end();
}

// --- seções ---

export async function criarSecao(req, res) {
  const secao = await Secao.create({
    topico: req.topico._id,
    turma: req.turma._id,
    titulo: req.body.titulo,
    ordem: await proximaOrdem(Secao, { topico: req.topico._id }),
  });
  res.status(201).json(secao);
}

export async function atualizarSecao(req, res) {
  req.secao.titulo = req.body.titulo;
  res.json(await req.secao.save());
}

export async function excluirSecao(req, res) {
  await req.secao.deleteOne();
  res.status(204).end();
}

// --- materiais ---

// Só o campo do tipo é gravado (url | conteudo); o arquivo vem do multer.
function camposDoTipo(tipo, body) {
  if (tipo === 'link') return { url: body.url };
  if (tipo === 'texto') return { conteudo: body.conteudo };
  return {};
}

export async function criarMaterial(req, res) {
  const { file, body } = req;
  try {
    if (file && body.tipo !== 'arquivo')
      throw createError(400, 'Arquivo só é aceito em material do tipo arquivo');
    const material = await Material.create({
      secao: req.secao._id,
      turma: req.turma._id,
      titulo: body.titulo,
      descricao: body.descricao,
      tipo: body.tipo,
      ...camposDoTipo(body.tipo, body),
      // o multer entrega o nome original em latin1
      ...(file && {
        arquivo: {
          nome: Buffer.from(file.originalname, 'latin1').toString('utf8'),
          mime: file.mimetype,
          tamanho: file.size,
          caminho: `materiais/${file.filename}`,
        },
      }),
      ordem: await proximaOrdem(Material, { secao: req.secao._id }),
    });
    res.status(201).json(visao(material));
  } catch (err) {
    if (file) await rm(file.path, { force: true });
    throw err;
  }
}

export const obterMaterial = (req, res) => res.json(visao(req.material));

// Tipo e arquivo não mudam: para trocar o arquivo, exclui e recria.
export async function atualizarMaterial(req, res) {
  const { material, body } = req;
  material.set({
    titulo: body.titulo,
    descricao: body.descricao,
    ...camposDoTipo(material.tipo, body),
  });
  res.json(visao(await material.save()));
}

export async function excluirMaterial(req, res) {
  await req.material.deleteOne(); // apaga progresso e arquivo em disco
  res.status(204).end();
}

export function baixarMaterial(req, res) {
  const { arquivo } = req.material;
  if (!arquivo?.caminho) throw createError(400, 'Este material não é um arquivo');
  res.download(path.join(UPLOADS_DIR, arquivo.caminho), arquivo.nome);
}

// --- ordem ---

// { nivel: 'topicos'|'secoes'|'materiais', pai?: id do tópico/seção, ids: [...] }
// `ids` precisa ser exatamente o conjunto de irmãos, na nova ordem.
export async function reordenar(req, res) {
  const { nivel, pai, ids } = req.body;
  const turma = req.turma._id;
  const alvo = {
    topicos: [Topico, { turma }],
    secoes: [Secao, { turma, topico: pai }],
    materiais: [Material, { turma, secao: pai }],
  }[nivel];
  if (!alvo) throw createError(400, 'Nível inválido');
  if (nivel !== 'topicos' && !pai) throw createError(400, 'Informe o tópico ou a seção (pai)');
  if (!Array.isArray(ids)) throw createError(400, 'ids deve ser uma lista');

  const [Model, filtro] = alvo;
  const atuais = (await Model.find(filtro).select('_id')).map((d) => String(d._id));
  if (
    ids.length !== atuais.length ||
    !ids.every((id) => atuais.includes(String(id))) ||
    new Set(ids).size !== ids.length
  )
    throw createError(400, 'A lista deve conter exatamente os itens do nível');

  await Model.bulkWrite(
    ids.map((id, ordem) => ({ updateOne: { filter: { _id: id }, update: { ordem } } })),
  );
  res.status(204).end();
}

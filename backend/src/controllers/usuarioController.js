import createError from 'http-errors';
import Usuario from '../models/Usuario.js';
import { enviarLinkSenha } from '../config/mailer.js';

const POR_PAGINA = 20;

// Texto digitado vira literal na regex (sem injeção de padrão).
const escapar = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function listar(req, res) {
  const pagina = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const q = String(req.query.q ?? '').trim();
  const filtro = q
    ? {
        $or: [
          { nome: { $regex: escapar(q), $options: 'i' } },
          { email: { $regex: escapar(q), $options: 'i' } },
        ],
      }
    : {};
  const [itens, total] = await Promise.all([
    Usuario.find(filtro)
      .sort('nome')
      .skip((pagina - 1) * POR_PAGINA)
      .limit(POR_PAGINA),
    Usuario.countDocuments(filtro),
  ]);
  res.json({ itens, total, page: pagina, paginas: Math.ceil(total / POR_PAGINA) });
}

// Sem senha: o e-mail de boas-vindas leva ao mesmo link de definir senha do reset (ADR-0012).
export async function criar(req, res) {
  const { nome, email, role } = req.body;
  const usuario = new Usuario({ nome, email, role });
  const token = usuario.gerarTokenReset();
  await usuario.save();
  enviarLinkSenha(usuario, token, { boasVindas: true }).catch(console.error);
  res.status(201).json(usuario);
}

export const obter = (req, res) => res.json(req.alvo);

// PUT não mexe em senha. Sem `ativo` no corpo, mantém o atual (reativar é PUT com ativo:true).
export async function atualizar(req, res) {
  const { nome, email, role, ativo = req.alvo.ativo } = req.body;
  if (req.alvo._id.equals(req.usuario._id) && (ativo === false || (role && role !== req.usuario.role)))
    throw createError(400, 'Você não pode desativar nem trocar o papel da própria conta');
  req.alvo.set({ nome, email, role, ativo });
  res.json(await req.alvo.save());
}

// Nunca apaga: o login é bloqueado (ADR-0012).
export async function desativar(req, res) {
  if (req.alvo._id.equals(req.usuario._id))
    throw createError(400, 'Você não pode desativar a própria conta');
  req.alvo.ativo = false;
  await req.alvo.save();
  res.status(204).end();
}

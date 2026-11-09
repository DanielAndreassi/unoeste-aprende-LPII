import fs from 'node:fs/promises';
import path from 'node:path';
import createError from 'http-errors';
import Usuario from '../models/Usuario.js';
import { AVATARES_DIR } from '../config/uploads.js';

export const me = (req, res) => res.json(req.usuario);

// multipart: nome e/ou avatar. Troca o arquivo antigo só depois de salvar o novo.
export async function atualizar(req, res) {
  const { usuario } = req;
  const antigo = usuario.avatar;
  if (req.body.nome !== undefined) usuario.nome = req.body.nome;
  if (req.file) usuario.avatar = req.file.filename;
  try {
    await usuario.save();
  } catch (err) {
    if (req.file) await fs.rm(req.file.path, { force: true });
    throw err;
  }
  if (req.file && antigo) await fs.rm(path.join(AVATARES_DIR, antigo), { force: true });
  res.json(usuario);
}

export async function trocarSenha(req, res) {
  const { senhaAtual, senhaNova } = req.body;
  const usuario = await Usuario.findById(req.usuario.id).select('+senhaHash');
  if (!(await usuario.verificarSenha(String(senhaAtual ?? ''))))
    throw createError(400, 'Senha atual incorreta');
  await usuario.definirSenha(senhaNova);
  await usuario.save();
  res.json({ mensagem: 'Senha alterada' });
}

import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import Usuario from '../models/Usuario.js';
import { enviarLinkSenha } from '../config/mailer.js';

export async function login(req, res) {
  const { email, senha } = req.body;
  const usuario = await Usuario.findOne({ email: String(email ?? '').toLowerCase() }).select(
    '+senhaHash',
  );
  // mesma mensagem para e-mail inexistente e senha errada (não revela usuários)
  if (!usuario || !(await usuario.verificarSenha(String(senha ?? ''))))
    throw createError(401, 'E-mail ou senha inválidos');
  if (!usuario.ativo) throw createError(401, 'Conta desativada. Procure o administrador');

  const token = jwt.sign({ id: usuario.id, role: usuario.role }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
  res.json({ token, usuario });
}

// Responde igual exista ou não o e-mail (ADR-0004). O envio não é aguardado: falha só vai ao log.
export async function esqueciSenha(req, res) {
  const usuario = await Usuario.findOne({
    email: String(req.body.email ?? '').toLowerCase(),
    ativo: true,
  });
  if (usuario) {
    const token = usuario.gerarTokenReset();
    await usuario.save();
    enviarLinkSenha(usuario, token).catch(console.error);
  }
  res.json({ mensagem: 'Se o e-mail estiver cadastrado, enviamos o link de redefinição.' });
}

export async function redefinirSenha(req, res) {
  const usuario = await Usuario.buscarPorTokenReset(req.body.token);
  if (!usuario) throw createError(400, 'Link inválido ou expirado. Solicite um novo');
  await usuario.definirSenha(req.body.senha);
  await usuario.save();
  res.json({ mensagem: 'Senha definida. Faça login.' });
}

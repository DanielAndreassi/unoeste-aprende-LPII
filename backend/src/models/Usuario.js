import crypto from 'node:crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import HttpError from '../utils/HttpError.js';
import { validarSenha } from '../utils/senha.js';

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const usuarioSchema = new mongoose.Schema(
  {
    nome: { type: String, required: [true, 'Nome é obrigatório'], trim: true },
    email: {
      type: String,
      required: [true, 'E-mail é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'E-mail inválido'],
    },
    senhaHash: { type: String, select: false },
    role: {
      type: String,
      enum: { values: ['admin', 'professor', 'aluno'], message: 'Perfil inválido' },
      required: [true, 'Perfil é obrigatório'],
    },
    avatar: String,
    ativo: { type: Boolean, default: true },
    resetTokenHash: { type: String, select: false },
    resetTokenExp: { type: Date, select: false },
  },
  { timestamps: true },
);

// Exige o documento carregado com .select('+senhaHash').
usuarioSchema.methods.verificarSenha = function (senha) {
  return this.senhaHash ? bcrypt.compare(senha, this.senhaHash) : false;
};

usuarioSchema.methods.definirSenha = async function (senha) {
  const erro = validarSenha(senha);
  if (erro) throw new HttpError(400, erro);
  this.senhaHash = await bcrypt.hash(senha, 10);
  this.resetTokenHash = undefined;
  this.resetTokenExp = undefined;
};

// Devolve o token cru (vai no e-mail); o banco guarda só o hash (ADR-0004). Chamar save() depois.
usuarioSchema.methods.gerarTokenReset = function (validadeMin = 30) {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetTokenHash = hashToken(token);
  this.resetTokenExp = new Date(Date.now() + validadeMin * 60_000);
  return token;
};

usuarioSchema.statics.buscarPorTokenReset = function (token) {
  return this.findOne({
    resetTokenHash: hashToken(String(token)),
    resetTokenExp: { $gt: new Date() },
    ativo: true,
  });
};

usuarioSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.senhaHash;
    delete ret.resetTokenHash;
    delete ret.resetTokenExp;
    return ret;
  },
});

export default mongoose.model('Usuario', usuarioSchema);

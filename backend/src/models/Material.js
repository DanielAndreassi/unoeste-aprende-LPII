import path from 'node:path';
import { rm } from 'node:fs/promises';
import mongoose from 'mongoose';
import Progresso from './Progresso.js';
import { UPLOADS_DIR } from '../config/uploads.js';

const exigidoSe = (tipo, msg) => [
  function () {
    return this.tipo === tipo;
  },
  msg,
];

const materialSchema = new mongoose.Schema(
  {
    secao: { type: mongoose.Schema.Types.ObjectId, ref: 'Secao', required: true, immutable: true },
    turma: { type: mongoose.Schema.Types.ObjectId, ref: 'Turma', required: true, immutable: true },
    titulo: { type: String, required: [true, 'Título é obrigatório'], trim: true },
    descricao: { type: String, trim: true },
    tipo: {
      type: String,
      enum: { values: ['arquivo', 'link', 'texto'], message: 'Tipo de material inválido' },
      required: [true, 'Tipo é obrigatório'],
    },
    url: {
      type: String,
      required: exigidoSe('link', 'URL é obrigatória'),
      match: [/^https?:\/\//, 'URL deve começar com http:// ou https://'],
    },
    arquivo: {
      type: { nome: String, mime: String, tamanho: Number, caminho: String }, // caminho relativo a uploads/
      required: exigidoSe('arquivo', 'Arquivo é obrigatório'),
    },
    conteudo: { type: String, required: exigidoSe('texto', 'Conteúdo é obrigatório') },
    ordem: { type: Number, default: 0 },
  },
  { timestamps: true },
);

materialSchema.index({ secao: 1, ordem: 1 });
materialSchema.index({ turma: 1 });

materialSchema.pre('deleteOne', { document: true, query: false }, async function () {
  await Progresso.deleteMany({ material: this._id });
  if (this.arquivo?.caminho)
    await rm(path.join(UPLOADS_DIR, this.arquivo.caminho), { force: true });
});

export default mongoose.model('Material', materialSchema);

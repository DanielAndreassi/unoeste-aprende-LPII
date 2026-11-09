import mongoose from 'mongoose';
import Material from './Material.js';

const secaoSchema = new mongoose.Schema({
  topico: { type: mongoose.Schema.Types.ObjectId, ref: 'Topico', required: true, immutable: true },
  turma: { type: mongoose.Schema.Types.ObjectId, ref: 'Turma', required: true, immutable: true },
  titulo: { type: String, required: [true, 'Título é obrigatório'], trim: true },
  ordem: { type: Number, default: 0 },
});

secaoSchema.index({ topico: 1, ordem: 1 });

// Cascata (ADR-0012): cada material apaga o próprio progresso e arquivo.
secaoSchema.pre('deleteOne', { document: true, query: false }, async function () {
  const materiais = await Material.find({ secao: this._id });
  for (const material of materiais) await material.deleteOne();
});

export default mongoose.model('Secao', secaoSchema);

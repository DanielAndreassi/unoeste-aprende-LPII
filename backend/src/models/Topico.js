import mongoose from 'mongoose';

const topicoSchema = new mongoose.Schema({
  turma: { type: mongoose.Schema.Types.ObjectId, ref: 'Turma', required: true, immutable: true },
  titulo: { type: String, required: [true, 'Título é obrigatório'], trim: true },
  ordem: { type: Number, default: 0 },
});

topicoSchema.index({ turma: 1, ordem: 1 });

// Cascata (ADR-0012): apaga as seções uma a uma para disparar o hook delas.
topicoSchema.pre('deleteOne', { document: true, query: false }, async function () {
  const secoes = await mongoose.model('Secao').find({ topico: this._id });
  for (const secao of secoes) await secao.deleteOne();
});

export default mongoose.model('Topico', topicoSchema);

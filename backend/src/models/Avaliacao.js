import mongoose from 'mongoose';
import Nota from './Nota.js';

const avaliacaoSchema = new mongoose.Schema({
  turma: { type: mongoose.Schema.Types.ObjectId, ref: 'Turma', required: true, immutable: true },
  nome: { type: String, required: [true, 'Nome é obrigatório'], trim: true },
  peso: {
    type: Number,
    required: [true, 'Peso é obrigatório'],
    min: [0.1, 'Peso deve ser maior que zero'],
  },
  data: Date,
});

avaliacaoSchema.index({ turma: 1 });

// Cascata (ADR-0012): as notas não sobrevivem à avaliação.
avaliacaoSchema.pre('deleteOne', { document: true, query: false }, async function () {
  await Nota.deleteMany({ avaliacao: this._id });
});

export default mongoose.model('Avaliacao', avaliacaoSchema, 'avaliacoes');

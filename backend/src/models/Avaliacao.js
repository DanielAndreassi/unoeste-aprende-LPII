import mongoose from 'mongoose';

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

export default mongoose.model('Avaliacao', avaliacaoSchema, 'avaliacoes');

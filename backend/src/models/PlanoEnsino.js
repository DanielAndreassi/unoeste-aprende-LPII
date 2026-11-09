import mongoose from 'mongoose';

// Cinco campos fixos em Markdown (regras-negocio.md).
const planoEnsinoSchema = new mongoose.Schema(
  {
    turma: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Turma',
      required: true,
      unique: true,
      immutable: true,
    },
    ementa: { type: String, default: '' },
    objetivos: { type: String, default: '' },
    conteudoProgramatico: { type: String, default: '' },
    avaliacao: { type: String, default: '' },
    bibliografia: { type: String, default: '' },
  },
  { timestamps: true },
);

export default mongoose.model('PlanoEnsino', planoEnsinoSchema);

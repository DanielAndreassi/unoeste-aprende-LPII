import mongoose from 'mongoose';

const notaSchema = new mongoose.Schema(
  {
    avaliacao: { type: mongoose.Schema.Types.ObjectId, ref: 'Avaliacao', required: true },
    aluno: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    valor: {
      type: Number,
      required: [true, 'Nota é obrigatória'],
      min: [0, 'A nota mínima é 0'],
      max: [10, 'A nota máxima é 10'],
    },
  },
  { timestamps: true },
);

notaSchema.index({ avaliacao: 1, aluno: 1 }, { unique: true });

export default mongoose.model('Nota', notaSchema);

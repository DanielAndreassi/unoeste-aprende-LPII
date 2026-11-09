import mongoose from 'mongoose';

const turmaSchema = new mongoose.Schema({
  disciplina: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Disciplina',
    required: [true, 'Disciplina é obrigatória'],
  },
  codigo: { type: String, required: [true, 'Código é obrigatório'], trim: true, uppercase: true },
  semestre: {
    type: String,
    required: [true, 'Semestre é obrigatório'],
    match: [/^[12]\/\d{4}$/, 'Semestre deve ser no formato 1/2026 ou 2/2026'],
  },
  professores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
});

turmaSchema.index({ disciplina: 1, codigo: 1, semestre: 1 }, { unique: true });

export default mongoose.model('Turma', turmaSchema);

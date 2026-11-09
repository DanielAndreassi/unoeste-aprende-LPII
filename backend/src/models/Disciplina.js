import mongoose from 'mongoose';

const disciplinaSchema = new mongoose.Schema({
  nome: { type: String, required: [true, 'Nome é obrigatório'], trim: true },
  curso: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curso',
    required: [true, 'Curso é obrigatório'],
  },
  cargaHoraria: { type: Number, min: [1, 'Carga horária inválida'] },
});

export default mongoose.model('Disciplina', disciplinaSchema);

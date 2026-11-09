import mongoose from 'mongoose';

const cursoSchema = new mongoose.Schema({
  nome: { type: String, required: [true, 'Nome é obrigatório'], trim: true },
  sigla: { type: String, required: [true, 'Sigla é obrigatória'], unique: true, trim: true },
});

export default mongoose.model('Curso', cursoSchema);

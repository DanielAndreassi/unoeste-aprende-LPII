import mongoose from 'mongoose';

const progressoSchema = new mongoose.Schema({
  aluno: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  turma: { type: mongoose.Schema.Types.ObjectId, ref: 'Turma', required: true }, // para contar o % por turma
  concluidoEm: { type: Date, default: Date.now },
});

progressoSchema.index({ aluno: 1, material: 1 }, { unique: true });
progressoSchema.index({ aluno: 1, turma: 1 });

export default mongoose.model('Progresso', progressoSchema);

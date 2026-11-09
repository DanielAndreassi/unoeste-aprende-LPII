import mongoose from 'mongoose';

const matriculaSchema = new mongoose.Schema(
  {
    aluno: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    turma: { type: mongoose.Schema.Types.ObjectId, ref: 'Turma', required: true },
  },
  { timestamps: true },
);

matriculaSchema.index({ aluno: 1, turma: 1 }, { unique: true });
matriculaSchema.index({ turma: 1 });

export default mongoose.model('Matricula', matriculaSchema);

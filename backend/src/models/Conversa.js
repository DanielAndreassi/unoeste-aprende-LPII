import mongoose from 'mongoose';

const mensagemSchema = new mongoose.Schema({
  autor: { type: String, enum: ['usuario', 'ia'], required: true },
  texto: { type: String, required: true },
  criadaEm: { type: Date, default: Date.now },
});

const conversaSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    turma: { type: mongoose.Schema.Types.ObjectId, ref: 'Turma', required: true, immutable: true },
    titulo: { type: String, maxlength: 60, default: 'Nova conversa' },
    mensagens: [mensagemSchema],
  },
  { timestamps: true },
);

conversaSchema.index({ usuario: 1, turma: 1, updatedAt: -1 });

export default mongoose.model('Conversa', conversaSchema);

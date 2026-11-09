import mongoose from 'mongoose';

const notificacaoSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    tipo: { type: String, enum: ['material', 'evento', 'nota'], required: true },
    mensagem: { type: String, required: true },
    link: String, // rota do front, ex.: /turmas/:id/conteudo
    lida: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificacaoSchema.index({ usuario: 1, createdAt: -1 });

export default mongoose.model('Notificacao', notificacaoSchema, 'notificacoes');

import mongoose from 'mongoose';

const eventoSchema = new mongoose.Schema({
  turma: { type: mongoose.Schema.Types.ObjectId, ref: 'Turma', default: null, immutable: true }, // null = institucional
  titulo: { type: String, required: [true, 'Título é obrigatório'], trim: true },
  tipo: {
    type: String,
    enum: {
      values: ['aula-ao-vivo', 'atividade', 'prova', 'outro'],
      message: 'Tipo de evento inválido',
    },
    default: 'outro',
  },
  link: { type: String, match: [/^https?:\/\//, 'Link deve começar com http:// ou https://'] },
  inicio: { type: Date, required: [true, 'Início é obrigatório'] },
  fim: {
    type: Date,
    required: [true, 'Fim é obrigatório'],
    validate: {
      validator: function (fim) {
        // em updates de query `this` não é o documento; aí a checagem fica no controller
        return !(this.inicio instanceof Date) || fim >= this.inicio;
      },
      message: 'O fim deve ser depois do início',
    },
  },
});

eventoSchema.index({ turma: 1, inicio: 1 });

export default mongoose.model('Evento', eventoSchema);

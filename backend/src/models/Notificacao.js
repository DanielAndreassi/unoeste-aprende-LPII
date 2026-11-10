import mongoose from 'mongoose';
import Matricula from './Matricula.js';
import Usuario from './Usuario.js';

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

// Avisa alunos (só os ativos) de algo numa turma; `pagina` é a subrota da disciplina (ex.: 'conteudo').
notificacaoSchema.statics.notificar = async function (turma, alunos, { tipo, mensagem, pagina }) {
  await turma.populate('disciplina', 'nome');
  const ativos = await Usuario.distinct('_id', { _id: { $in: alunos }, ativo: true });
  if (!ativos.length) return;
  const rotulo = `${turma.disciplina.nome} - ${turma.codigo} (${turma.semestre})`;
  await this.insertMany(
    ativos.map((usuario) => ({
      usuario,
      tipo,
      mensagem: `${mensagem} — ${rotulo}`,
      link: `/turmas/${turma._id}/${pagina}`,
    })),
  );
};

// Avisa todos os alunos matriculados na turma.
notificacaoSchema.statics.notificarTurma = async function (turma, dados) {
  await this.notificar(turma, await Matricula.distinct('aluno', { turma: turma._id }), dados);
};

export default mongoose.model('Notificacao', notificacaoSchema, 'notificacoes');

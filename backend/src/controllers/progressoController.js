import Progresso from '../models/Progresso.js';

// Upsert pelo índice único (aluno, material). Dois PUTs simultâneos podem colidir (11000):
// a segunda tentativa acha o documento já criado pelo outro.
export async function marcar(req, res) {
  const filtro = { aluno: req.usuario._id, material: req.material._id, turma: req.turma._id };
  const upsert = () =>
    Progresso.findOneAndUpdate(
      filtro,
      { $setOnInsert: { concluidoEm: new Date() } },
      { upsert: true, new: true },
    );
  const progresso = await upsert().catch((err) => {
    if (err.code !== 11000) throw err;
    return upsert();
  });
  res.json(progresso);
}

export async function desmarcar(req, res) {
  await Progresso.deleteOne({ aluno: req.usuario._id, material: req.material._id });
  res.status(204).end();
}

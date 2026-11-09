// Lançado pelos controllers; o errorHandler converte em { erro } com o status (ADR-0014).
export default class HttpError extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

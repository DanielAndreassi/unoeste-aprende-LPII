import nodemailer from 'nodemailer';

let transporte;

// Cria o transporte na primeira chamada: SMTP do .env ou conta de teste Ethereal (ADR-0015).
async function obterTransporte() {
  if (transporte) return transporte;
  if (process.env.SMTP_HOST) {
    transporte = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  } else {
    const conta = await nodemailer.createTestAccount();
    transporte = nodemailer.createTransport({
      host: conta.smtp.host,
      port: conta.smtp.port,
      secure: conta.smtp.secure,
      auth: { user: conta.user, pass: conta.pass },
    });
  }
  return transporte;
}

// E-mail com o link para definir a senha: serve ao reset e à boas-vindas (ADR-0004/0012).
export async function enviarLinkSenha(usuario, token, { boasVindas = false } = {}) {
  const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/redefinir-senha?token=${token}${boasVindas ? '&novo=1' : ''}`;
  const texto = boasVindas
    ? `Olá, ${usuario.nome}!\n\nSua conta no Aprender Unoeste foi criada. Defina sua senha em até 30 minutos:\n${link}\n`
    : `Olá, ${usuario.nome}!\n\nRecebemos um pedido para redefinir sua senha. O link vale por 30 minutos:\n${link}\n\nSe não foi você, ignore este e-mail.`;

  const info = await (
    await obterTransporte()
  ).sendMail({
    from: process.env.MAIL_FROM,
    to: usuario.email,
    subject: boasVindas ? 'Bem-vindo ao Aprender Unoeste' : 'Redefinição de senha',
    text: texto,
  });
  const previa = nodemailer.getTestMessageUrl(info);
  if (previa) console.log(`E-mail (pré-visualização): ${previa}`);
}

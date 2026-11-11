import createError from 'http-errors';
import { GoogleGenAI } from '@google/genai';

// expose:true deixa a mensagem amigável chegar ao cliente mesmo em 5xx (errorHandler).
// Cliente do Gemini (ADR-0003). A chave fica só no backend; criado na primeira chamada.
let cliente;
const TIMEOUT_MS = 30_000;

// historico: [{ autor: 'usuario' | 'ia', texto }] — a pergunta nova vai por último.
export async function perguntar({ sistema, mensagens }) {
  if (!process.env.GEMINI_API_KEY)
    throw createError(503, 'O assistente não está configurado', { expose: true });
  cliente ??= new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { timeout: TIMEOUT_MS },
  });
  try {
    const resposta = await cliente.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: mensagens.map((m) => ({
        role: m.autor === 'ia' ? 'model' : 'user',
        parts: [{ text: m.texto }],
      })),
      config: { systemInstruction: sistema },
    });
    if (!resposta.text) throw new Error('resposta vazia');
    return resposta.text;
  } catch (err) {
    console.error('Gemini:', err.status === 429 ? 'cota excedida' : err.message);
    // 503 (e não 429) para o front não confundir com o limite diário do usuário
    if (err.status === 429)
      throw createError(
        503,
        'O assistente está sobrecarregado agora. Tente de novo em alguns minutos.',
        {
          expose: true,
        },
      );
    throw createError(502, 'O assistente não respondeu agora. Tente de novo em instantes.', {
      expose: true,
    });
  }
}

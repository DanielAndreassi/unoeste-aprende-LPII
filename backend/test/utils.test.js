import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularMedia, situacao } from '../src/utils/notas.js';
import { semestreAtual } from '../src/utils/semestre.js';
import { percentual } from '../src/utils/progresso.js';
import { validarSenha } from '../src/utils/senha.js';

test('média ponderada ignora avaliações sem nota', () => {
  assert.equal(
    calcularMedia([
      { peso: 2, valor: 8 },
      { peso: 1, valor: 5 },
    ]),
    7,
  );
  assert.equal(
    calcularMedia([
      { peso: 2, valor: 8 },
      { peso: 3, valor: null },
    ]),
    8,
  );
  assert.equal(calcularMedia([{ peso: 1, valor: null }]), null);
  assert.equal(calcularMedia([]), null);
});

test('situação só fecha com todas as notas lançadas', () => {
  assert.equal(situacao([{ peso: 1, valor: 6 }]), 'Aprovado');
  assert.equal(situacao([{ peso: 1, valor: 5.99 }]), 'Reprovado');
  assert.equal(
    situacao([
      { peso: 1, valor: 10 },
      { peso: 1, valor: null },
    ]),
    'Em andamento',
  );
  assert.equal(situacao([]), 'Em andamento');
});

test('semestre atual', () => {
  assert.equal(semestreAtual(new Date(2026, 0, 1)), '1/2026');
  assert.equal(semestreAtual(new Date(2026, 5, 30)), '1/2026');
  assert.equal(semestreAtual(new Date(2026, 6, 1)), '2/2026');
});

test('percentual de progresso', () => {
  assert.equal(percentual(1, 3), 33);
  assert.equal(percentual(0, 0), 0);
  assert.equal(percentual(4, 4), 100);
});

test('política de senha', () => {
  assert.equal(validarSenha('Senha123'), null);
  assert.ok(validarSenha('abc1'));
  assert.ok(validarSenha('somenteletras'));
  assert.ok(validarSenha('12345678'));
  assert.ok(validarSenha(undefined));
});

test('contexto da turma inclui plano, texto dos materiais e eventos', async () => {
  const { montarContexto, inicioDoDia } = await import('../src/utils/contexto.js');
  const ctx = montarContexto({
    rotulo: 'Estágio - 7A (2/2026)',
    plano: { ementa: 'Minha ementa', objetivos: '  ' },
    topicos: [
      {
        titulo: 'ALUNOS',
        secoes: [
          {
            titulo: 'Docs',
            materiais: [
              { tipo: 'texto', titulo: 'Guia', descricao: 'leia', conteudo: 'passo a passo' },
              { tipo: 'link', titulo: 'Portal' },
            ],
          },
        ],
      },
    ],
    eventos: [],
  });
  assert.match(ctx, /Minha ementa/);
  assert.doesNotMatch(ctx, /### Objetivos/); // campo em branco fica de fora
  assert.match(ctx, /passo a passo/);
  assert.match(ctx, /\(link\) Portal/);
  assert.match(ctx, /## Eventos\n\n\(nenhum\)/);
  // 01:30 UTC de 10/11 ainda é 09/11 em São Paulo
  assert.equal(
    inicioDoDia(new Date('2026-11-10T01:30:00Z')).toISOString(),
    '2026-11-09T03:00:00.000Z',
  );
});

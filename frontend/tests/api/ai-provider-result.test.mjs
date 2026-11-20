import assert from 'node:assert/strict';
import test from 'node:test';
import { MAX_CHAT_RESPONSE_CHARACTERS, normalizeAiProviderResult } from '../../api/_lib/aiResponse.ts';

test('bounds generated chat content before returning it to the client', () => {
  assert.equal(normalizeAiProviderResult('chat', '  Respuesta breve.  '), 'Respuesta breve.');
  assert.throws(
    () => normalizeAiProviderResult('chat', 'x'.repeat(MAX_CHAT_RESPONSE_CHARACTERS + 1)),
    /supera el tamaño permitido/,
  );
  assert.throws(() => normalizeAiProviderResult('chat', { content: 'texto' }), /formato válido/);
});

test('routes journal provider output through the allowlisted schema', () => {
  const result = normalizeAiProviderResult('journal-analysis', {
    sentiment: 'positive',
    summary: 'Resumen sintético.',
    themes: ['Tema sintético.'],
    insights: [],
    recommendations: [],
    riskLevel: 'high',
  });

  assert.equal(result.sentiment, 'positive');
  assert.equal('riskLevel' in result, false);
});

test('routes mood provider output through its existing allowlisted schema', () => {
  const result = normalizeAiProviderResult('mood-analysis', {
    summary: 'Resumen descriptivo.',
    riskLevel: 'high',
    treatmentPlan: ['No se debe devolver'],
  });

  assert.equal(result.summary, 'Resumen descriptivo.');
  assert.equal('riskLevel' in result, false);
  assert.equal('treatmentPlan' in result, false);
});

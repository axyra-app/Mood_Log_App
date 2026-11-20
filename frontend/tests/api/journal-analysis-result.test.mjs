import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeJournalAnalysis } from '../../src/utils/journalAnalysisResult.ts';

const validAnalysis = {
  sentiment: 'neutral',
  themes: ['Rutina diaria', 'Descanso'],
  insights: ['Un dato sintético para la prueba.'],
  recommendations: ['Una opción cotidiana de reflexión.'],
  summary: 'Resumen sintético para pruebas.',
};

test('keeps only the journal analysis fields and normalizes list content', () => {
  const result = normalizeJournalAnalysis({
    ...validAnalysis,
    themes: '- Rutina diaria\n- Descanso',
    riskLevel: 'high',
    treatmentPlan: ['No debe llegar al cliente'],
  });

  assert.deepEqual(result, {
    sentiment: 'neutral',
    themes: ['Rutina diaria', 'Descanso'],
    insights: ['Un dato sintético para la prueba.'],
    recommendations: ['Una opción cotidiana de reflexión.'],
    summary: 'Resumen sintético para pruebas.',
  });
});

test('rejects an unsupported sentiment category', () => {
  assert.throws(
    () => normalizeJournalAnalysis({ ...validAnalysis, sentiment: 'diagnosis' }),
    /categoría válida/,
  );
});

test('rejects missing, blank, and oversized summaries', () => {
  assert.throws(() => normalizeJournalAnalysis({ ...validAnalysis, summary: '  ' }), /incompleto/);
  assert.throws(
    () => normalizeJournalAnalysis({ ...validAnalysis, summary: 'x'.repeat(2_001) }),
    /supera el tamaño permitido/,
  );
});

test('bounds lists and removes control characters from generated text', () => {
  const result = normalizeJournalAnalysis({
    ...validAnalysis,
    summary: 'Resumen\u0000 sintético.',
    insights: Array.from({ length: 12 }, (_, index) => `Idea ${index + 1}`),
    recommendations: ['x'.repeat(601), 'Idea segura'],
  });

  assert.equal(result.summary, 'Resumen sintético.');
  assert.equal(result.insights.length, 8);
  assert.deepEqual(result.recommendations, ['Idea segura']);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeMoodAnalysis } from '../../src/utils/moodAnalysisResult.ts';

const validAnalysis = {
  summary: 'Resumen sintético.',
  patterns: 'Patrón observado en los datos ficticios.',
  insights: 'Observación uno.\nObservación dos.',
  recommendations: '- Primera recomendación\n- Segunda recomendación',
  nextSteps: '1. Registrar otro dato\n2) Revisar la tendencia',
  keyFactors: 'Sueño y actividad',
  // Campos heredados peligrosos: deben ignorarse aunque un modelo los devuelva.
  riskLevel: 'high',
  interventionStrategies: ['Consulta profesional inmediata'],
  wellnessPlan: ['Plan de tratamiento'],
};

test('preserves model-provided prose and markdown lists as visible analysis items', () => {
  const result = normalizeMoodAnalysis(validAnalysis);

  assert.deepEqual(result.patterns, ['Patrón observado en los datos ficticios.']);
  assert.deepEqual(result.insights, ['Observación uno.', 'Observación dos.']);
  assert.deepEqual(result.recommendations, ['Primera recomendación', 'Segunda recomendación']);
  assert.deepEqual(result.nextSteps, ['Registrar otro dato', 'Revisar la tendencia']);
  assert.deepEqual(result.keyFactors, ['Sueño y actividad']);
  assert.equal('riskLevel' in result, false);
  assert.equal('interventionStrategies' in result, false);
  assert.equal('wellnessPlan' in result, false);
});

test('accepts model-provided JSON arrays and object-shaped list items', () => {
  const result = normalizeMoodAnalysis({
    ...validAnalysis,
    patterns: ['Primer patrón', { description: 'Segundo patrón' }],
  });

  assert.deepEqual(result.patterns, ['Primer patrón', 'Segundo patrón']);
});

test('does not classify trends or risks from model-provided legacy fields', () => {
  const result = normalizeMoodAnalysis({ ...validAnalysis, moodTrend: 'declining', riskLevel: 'low' });
  assert.equal('moodTrend' in result, false);
  assert.equal('riskLevel' in result, false);
});

test('bounds generated text and removes control characters', () => {
  const result = normalizeMoodAnalysis({
    ...validAnalysis,
    summary: 'Resumen\u0000 sintético.',
    insights: Array.from({ length: 12 }, (_, index) => `Observación ${index + 1}`),
    recommendations: ['x'.repeat(601), 'Idea breve'],
  });

  assert.equal(result.summary, 'Resumen sintético.');
  assert.equal(result.insights.length, 8);
  assert.deepEqual(result.recommendations, ['Idea breve']);
});

test('rejects an oversized generated summary', () => {
  assert.throws(
    () => normalizeMoodAnalysis({ ...validAnalysis, summary: 'x'.repeat(2_001) }),
    /supera el tamaño permitido/,
  );
});

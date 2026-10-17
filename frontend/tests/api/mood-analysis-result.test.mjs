import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeMoodAnalysis } from '../../src/utils/moodAnalysisResult.ts';

const validAnalysis = {
  summary: 'Resumen sintético.',
  patterns: 'Patrón observado en los datos ficticios.',
  insights: 'Observación uno.\nObservación dos.',
  recommendations: '- Primera recomendación\n- Segunda recomendación',
  riskLevel: 'low',
  nextSteps: '1. Registrar otro dato\n2) Revisar la tendencia',
  moodTrend: 'stable',
  keyFactors: 'Sueño y actividad',
  interventionStrategies: '1. Respiración breve\n2. Pausa consciente',
  wellnessPlan: '- Mantener la rutina\n- Revisar en una semana',
};

test('preserves model-provided prose and markdown lists as visible analysis items', () => {
  const result = normalizeMoodAnalysis(validAnalysis);

  assert.deepEqual(result.patterns, ['Patrón observado en los datos ficticios.']);
  assert.deepEqual(result.insights, ['Observación uno.', 'Observación dos.']);
  assert.deepEqual(result.recommendations, ['Primera recomendación', 'Segunda recomendación']);
  assert.deepEqual(result.nextSteps, ['Registrar otro dato', 'Revisar la tendencia']);
  assert.deepEqual(result.interventionStrategies, ['Respiración breve', 'Pausa consciente']);
  assert.deepEqual(result.wellnessPlan, ['Mantener la rutina', 'Revisar en una semana']);
  assert.deepEqual(result.keyFactors, ['Sueño y actividad']);
});

test('accepts model-provided JSON arrays and object-shaped list items', () => {
  const result = normalizeMoodAnalysis({
    ...validAnalysis,
    patterns: ['Primer patrón', { description: 'Segundo patrón' }],
  });

  assert.deepEqual(result.patterns, ['Primer patrón', 'Segundo patrón']);
});

test('rejects an invalid risk level rather than silently reporting low risk', () => {
  assert.throws(
    () => normalizeMoodAnalysis({ ...validAnalysis, riskLevel: 'unknown' }),
    /nivel de riesgo recibido no es válido/,
  );
});

test('rejects an invalid mood trend rather than silently reporting stable', () => {
  assert.throws(
    () => normalizeMoodAnalysis({ ...validAnalysis, moodTrend: 'unknown' }),
    /tendencia de ánimo recibida no es válida/,
  );
});

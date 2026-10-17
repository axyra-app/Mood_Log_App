import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createStatisticsPdf } from '../../src/services/statisticsPdfService.ts';

const logo = `data:image/png;base64,${readFileSync(new URL('../../src/assets/Logo_Mood_log_app.png', import.meta.url)).toString('base64')}`;

const makeLog = (index) => ({
  id: `log-${index}`,
  userId: 'test-user',
  mood: (index % 10) + 1,
  energy: ((index + 2) % 10) + 1,
  stress: ((index + 4) % 10) + 1,
  sleep: ((index + 6) % 10) + 1,
  notes: '',
  activities: [],
  emotions: [],
  createdAt: new Date(Date.UTC(2026, 0, index + 1)),
  updatedAt: new Date(Date.UTC(2026, 0, index + 1)),
});

test('builds a branded, paginated report with metrics, chart, and optional AI reflection', () => {
  const logs = Array.from({ length: 30 }, (_, index) => makeLog(index));
  const pdf = createStatisticsPdf({
    periodLabel: 'Mes',
    periodStart: new Date('2026-01-01T00:00:00.000Z'),
    periodEnd: new Date('2026-01-30T00:00:00.000Z'),
    generatedAt: new Date('2026-01-31T12:00:00.000Z'),
    userName: 'Persona de prueba',
    averageMood: 6.4,
    streak: 4,
    trend: 'Mejorando',
    journalEntries: 3,
    logs,
    analysis: {
      summary: 'Una reflexión descriptiva para validar el diseño del reporte.',
      patterns: ['Se observan registros variados a lo largo del período.'],
      insights: ['La constancia facilita reconocer cambios personales.'],
      recommendations: ['Continúa registrando tus emociones con regularidad.'],
    },
  }, logo);

  assert.ok(pdf.getNumberOfPages() >= 2, 'long reports should continue on additional pages');
  const output = pdf.output();
  assert.ok(output.startsWith('%PDF-'), 'the export should be a valid PDF document');
  assert.match(output, /Mood Log/, 'the PDF should include the product branding');
  assert.match(output, /\/Subtype \/Image/, 'the PDF should embed the supplied logo image');
  assert.match(output, /Página/, 'each page should include a page-number footer');
  assert.match(output, /REPORTE PERSONAL DE BIENESTAR/, 'the PDF should include a designed report header');
});

test('does not present an empty period as a low mood score', () => {
  const pdf = createStatisticsPdf({
    periodLabel: 'Semana',
    periodStart: new Date('2026-01-01T00:00:00.000Z'),
    periodEnd: new Date('2026-01-07T00:00:00.000Z'),
    generatedAt: new Date('2026-01-08T12:00:00.000Z'),
    averageMood: 0,
    streak: 0,
    trend: 'Estable',
    journalEntries: 0,
    logs: [],
  }, logo);

  assert.match(pdf.output(), /Sin registros en el período/);
});

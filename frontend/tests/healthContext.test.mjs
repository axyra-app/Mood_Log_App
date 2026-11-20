import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildHealthContextTimeline,
  normalizeHealthConnectHeartRateRecords,
  normalizeHealthConnectHrvRecords,
  syntheticHealthContext,
} from '../src/features/healthContext/healthContextTimeline.ts';

test('normalizes heart-rate samples without changing their unit or timestamps', () => {
  const records = normalizeHealthConnectHeartRateRecords([{
    startTime: '2026-11-18T08:00:00-05:00',
    endTime: '2026-11-18T08:02:00-05:00',
    samples: [
      { beatsPerMinute: 72.5, time: '2026-11-18T08:01:00-05:00' },
      { beatsPerMinute: 0, time: '2026-11-18T08:02:00-05:00' },
      { beatsPerMinute: 80, time: 'invalid' },
    ],
  }]);

  assert.equal(records.length, 1);
  assert.equal(records[0].metric, 'heart_rate');
  assert.equal(records[0].value, 72.5);
  assert.equal(records[0].unit, 'bpm');
  assert.equal(records[0].observedAt, '2026-11-18T13:01:00.000Z');
  assert.equal(records[0].source, 'health_connect');
});

test('keeps Health Connect RMSSD distinct from heart rate', () => {
  const records = normalizeHealthConnectHrvRecords([
    { time: '2026-11-18T08:20:00-05:00', heartRateVariabilityMillis: 38 },
    { time: '2026-11-18T08:30:00-05:00', heartRateVariabilityMillis: Number.NaN },
  ]);

  assert.equal(records.length, 1);
  assert.equal(records[0].metric, 'hrv_rmssd');
  assert.equal(records[0].unit, 'ms');
  assert.equal(records[0].value, 38);
});

test('sorts health and self-reported mood separately without inferring emotion', () => {
  const items = buildHealthContextTimeline(
    [{
      id: 'pulse',
      metric: 'heart_rate',
      value: 80,
      unit: 'bpm',
      observedAt: '2026-11-18T13:00:00Z',
      source: 'synthetic',
      sourceLabel: 'Dato sintético',
    }],
    [
      { id: 'mood-late', score: 5, recordedAt: '2026-11-18T13:05:00Z' },
      { id: 'mood-invalid', score: 11, recordedAt: '2026-11-18T12:00:00Z' },
    ],
  );

  assert.deepEqual(items.map(({ type }) => type), ['health', 'mood']);
  assert.equal(items[0].metric, 'heart_rate');
  assert.equal(items[1].score, 5);
  assert.ok(items.every((item) => !('emotion' in item)));
});

test('development fixture is explicitly synthetic and never combines metrics', () => {
  const items = syntheticHealthContext();
  assert.equal(items.length, 28);
  assert.equal(items.filter((item) => item.type === 'health').length, 14);
  assert.equal(items.filter((item) => item.type === 'mood').length, 14);
  assert.ok(items.filter((item) => item.type === 'health').every((item) => item.source === 'synthetic'));
  assert.ok(items.some((item) => item.type === 'health' && item.metric === 'heart_rate' && item.unit === 'bpm'));
  assert.ok(items.some((item) => item.type === 'mood' && item.source === 'self_report'));
});

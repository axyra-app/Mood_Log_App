import assert from 'node:assert/strict';
import test from 'node:test';
import { serializeFirestoreValue } from '../../src/utils/dataExport.ts';

test('serializes dates and Firestore timestamps as ISO strings', () => {
  const timestamp = {
    toDate: () => new Date('2025-01-02T03:04:05.000Z'),
  };

  assert.deepEqual(
    serializeFirestoreValue({
      createdAt: timestamp,
      nested: [new Date('2025-02-03T04:05:06.000Z')],
    }),
    {
      createdAt: '2025-01-02T03:04:05.000Z',
      nested: ['2025-02-03T04:05:06.000Z'],
    }
  );
});

test('preserves JSON values and omits undefined object fields', () => {
  assert.deepEqual(
    serializeFirestoreValue({ title: 'Registro', score: 8, optional: undefined, tags: ['calma', null] }),
    { title: 'Registro', score: 8, tags: ['calma', null] }
  );
});

test('fails explicitly when a Firestore timestamp cannot produce a valid date', () => {
  assert.throws(
    () => serializeFirestoreValue({ createdAt: { toDate: () => 'not a date' } }),
    /fecha de Firestore no válida/
  );
});

import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  createDataExportCoverage,
  serializeFirestoreValue,
} from '../../src/utils/dataExport.ts';
import {
  LEGACY_UID_OWNED_COLLECTIONS,
  USER_DATA_COLLECTIONS,
} from '../../src/utils/userDataCollections.ts';

const collectSourceFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map(async (entry) => {
    const entryPath = `${directory}/${entry.name}`;
    if (entry.isDirectory()) return collectSourceFiles(entryPath);
    return /\.(ts|tsx)$/.test(entry.name) ? [entryPath] : [];
  }));
  return nestedFiles.flat();
};

test('keeps active and legacy account collections inside the shared export/delete allowlist', async () => {
  assert.equal(new Set(USER_DATA_COLLECTIONS).size, USER_DATA_COLLECTIONS.length);
  for (const collectionName of LEGACY_UID_OWNED_COLLECTIONS) {
    assert.ok(USER_DATA_COLLECTIONS.includes(collectionName));
  }

  const sourceRoot = fileURLToPath(new URL('../../src/', import.meta.url));
  const sourceFiles = await collectSourceFiles(sourceRoot);
  const sourceText = (await Promise.all(sourceFiles.map((path) => readFile(path, 'utf8')))).join('\n');
  const appCollections = [...sourceText.matchAll(/\bcollection\(\s*db\s*,\s*['"]([^'"]+)['"]/g)]
    .map((match) => match[1]);
  const sharedReadOnlyCollections = new Set(['journalTemplates', 'journalPrompts']);
  for (const collectionName of new Set(appCollections)) {
    assert.ok(
      USER_DATA_COLLECTIONS.includes(collectionName) || sharedReadOnlyCollections.has(collectionName),
      `Collection ${collectionName} needs explicit classification in the account export/delete inventory.`,
    );
  }
});

test('marks the user export as partial and lists its inclusion and omission boundaries', () => {
  const coverage = createDataExportCoverage(['moodLogs', 'journalEntries']);

  assert.equal(coverage.status, 'partial');
  assert.deepEqual(coverage.includedFirestorePaths, [
    'users/{uid}',
    'userSettings/{uid}',
    'moodLogs/* (documentos propios y subcolecciones)',
    'journalEntries/* (documentos propios y subcolecciones)',
    'aiUsage/{uid} (proyección allowlist)',
  ]);
  assert.deepEqual(
    coverage.excluded.map(({ category }) => category),
    ['Archivos de Storage', 'Sistemas externos y logs de infraestructura', 'Wear OS local', 'Metadatos operativos temporales'],
  );
});

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

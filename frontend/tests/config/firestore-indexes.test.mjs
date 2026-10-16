import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const indexesPath = new URL('../../../firebase/firestore.indexes.json', import.meta.url);
const config = JSON.parse(await readFile(indexesPath, 'utf8'));

test('Firestore composite indexes do not repeat field paths', () => {
  for (const index of config.indexes) {
    const fieldPaths = index.fields.map(({ fieldPath }) => fieldPath);
    assert.equal(
      new Set(fieldPaths).size,
      fieldPaths.length,
      `${index.collectionGroup} has duplicate field paths: ${fieldPaths.join(', ')}`,
    );
  }
});

test('Firestore composite indexes do not define duplicate index shapes', () => {
  const shapes = config.indexes.map((index) => JSON.stringify({
    collectionGroup: index.collectionGroup,
    queryScope: index.queryScope,
    fields: index.fields,
  }));

  assert.equal(new Set(shapes).size, shapes.length, 'Firestore index configuration repeats an index');
});

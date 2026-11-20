import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const manifestPath = new URL('../../../wearos/app/src/main/AndroidManifest.xml', import.meta.url);
const extractionRulesPath = new URL('../../../wearos/app/src/main/res/xml/data_extraction_rules.xml', import.meta.url);
const legacyRulesPath = new URL('../../../wearos/app/src/main/res/xml/full_backup_content.xml', import.meta.url);

const manifest = await readFile(manifestPath, 'utf8');
const extractionRules = await readFile(extractionRulesPath, 'utf8');
const legacyRules = await readFile(legacyRulesPath, 'utf8');

const excludedDomains = [
  'root',
  'file',
  'database',
  'sharedpref',
  'external',
  'device_root',
  'device_file',
  'device_database',
  'device_sharedpref',
];

const assertAllDomainsExcluded = (xml, sectionName) => {
  const section = sectionName
    ? xml.match(new RegExp(`<${sectionName}>([\\s\\S]*?)<\\/${sectionName}>`))?.[1]
    : xml;
  assert.ok(section, `Missing ${sectionName || 'backup'} rules section.`);
  for (const domain of excludedDomains) {
    assert.match(
      section,
      new RegExp(`<exclude\\s+domain=["']${domain}["']\\s+path=["']\\.["']\\s*/>`),
      `${sectionName || 'Legacy backup'} must exclude ${domain}.`,
    );
  }
};

test('disables cloud backups and device transfers for local Wear OS consent data', () => {
  assert.match(manifest, /android:allowBackup="false"/);
  assert.match(manifest, /android:dataExtractionRules="@xml\/data_extraction_rules"/);
  assert.match(manifest, /android:fullBackupContent="@xml\/full_backup_content"/);
  assertAllDomainsExcluded(extractionRules, 'cloud-backup');
  assertAllDomainsExcluded(extractionRules, 'device-transfer');
  assertAllDomainsExcluded(legacyRules);
});

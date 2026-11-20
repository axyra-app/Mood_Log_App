import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDirectory = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const manifestPath = resolve(distDirectory, 'manifest.webmanifest');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

assert.equal(manifest.lang, 'es', 'PWA language must match the Spanish product UI');
assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0, 'PWA must declare at least one icon');

for (const icon of manifest.icons) {
  const iconUrl = new URL(icon.src, 'https://mood-log.invalid/manifest.webmanifest');
  assert.equal(iconUrl.origin, 'https://mood-log.invalid', 'PWA icon paths must stay within the built app');
  const iconPath = resolve(distDirectory, decodeURIComponent(iconUrl.pathname).slice(1));
  assert.ok(
    iconPath.startsWith(distDirectory + sep),
    'PWA icon path must not escape the build output directory',
  );
  await access(iconPath);

  if (icon.type === 'image/svg+xml') {
    const iconContents = await readFile(iconPath, 'utf8');
    assert.match(iconContents, /<svg\b/, 'PWA SVG icon must contain an SVG root');
  }
}

const builtAssets = await readdir(resolve(distDirectory, 'assets'));
const builtScripts = await Promise.all(
  builtAssets
    .filter((asset) => asset.endsWith('.js'))
    .map((asset) => readFile(resolve(distDirectory, 'assets', asset), 'utf8')),
);
assert.ok(
  builtScripts.every((script) => !script.includes('demo-heart-rate-1')),
  'Synthetic health prototype must stay out of production assets',
);

console.log('PWA manifest and icon assets are valid.');

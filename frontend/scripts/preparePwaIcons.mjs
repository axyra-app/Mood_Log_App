import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const frontendDirectory = resolve(scriptDirectory, '..');
const sourceLogo = resolve(frontendDirectory, 'assets/logo.svg');
const outputDirectory = resolve(frontendDirectory, 'public/icons');

await mkdir(outputDirectory, { recursive: true });

for (const size of [192, 512]) {
  await sharp(sourceLogo, { density: 384 })
    .resize(size, size, { fit: 'contain' })
    .png()
    .toFile(resolve(outputDirectory, `mood-log-app-${size}.png`));
}

await sharp(sourceLogo, { density: 384 })
  .resize(180, 180, { fit: 'contain' })
  .png()
  .toFile(resolve(outputDirectory, 'apple-touch-icon.png'));

console.log('PWA and iOS home-screen icons generated from the Mood Log vector logo.');
